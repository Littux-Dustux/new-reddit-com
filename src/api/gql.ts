import { getLogger } from "../logging/logger";
import { multiErrorToast } from "../logging/toast";
import { isLoggedIn } from "../state";
import { getCache, setCache } from "./caching";
import { getRedditRequestHeaders, parseResponseAndStoreAuth } from "./helpers";
import { RedditAPIError } from "./rest";

const logger = getLogger("api:gql");

// Track in-flight requests to deduplicate identical concurrent requests
const inFlightRequests = new Map<string, Promise<any>>();

export async function gqlFetch<T = any>(
	operationName: string,
	sha256Hash: string,
	variables: any,
	options: { parseJSON?: boolean, cache?: boolean, maxCacheAge?: number, anonymous?: boolean } = {},
): Promise<T> {
	options.parseJSON ??= true;
	options.cache ??= false;
	options.maxCacheAge ??= 5 * 60_000;
	options.anonymous ??= !isLoggedIn.value;

	const payload = JSON.stringify(variables);
	const cacheKey = operationName + "~" + payload;

	// If caching is enabled, check if this request is already in flight
	if (options.cache) {
		if (inFlightRequests.has(cacheKey)) {
			return inFlightRequests.get(cacheKey)!;
		}

		const data = getCache(cacheKey, options.maxCacheAge);
		if (data) {
			if (typeof data === "string") {
				return options.parseJSON ? JSON.parse(data).data : data as any;
			} else {
				return options.parseJSON ? data : JSON.stringify({ data }) as any;
			}
		}
	}

	logger.log(`${operationName}: ${payload?.slice(0, 160)}`);

	const fetchPromise = (async () => {
		let resp;

		try {
			resp = await window.gmFetch({
				method: "POST",
				url: "https://cf.gql-fed.reddit.com?" + operationName,
				headers: {
					"Content-Type": "application/json",
					"User-Agent": "Reddit/Version 2026.03.0/Build 2603061/Android 13",
					"X-Reddit-Translations": "enabled",
					...(await getRedditRequestHeaders(options.anonymous))
				},
				data: JSON.stringify({
					operationName,
					variables,
					extensions: {
						persistedQuery: {
							version: 1,
							sha256Hash,
						},
					},
				}),
				anonymous: true,
				timeout: 30_000,
			});
		} catch(e: any) {
			if (e?.error) {
				throw new TypeError(`Error fetching gql data: ${(e as Tampermonkey.ErrorResponse).statusText}`)
			} else {
				throw e;
			}
		}

		parseResponseAndStoreAuth(resp.responseHeaders);

		let data: any;
		if (resp.status !== 200
			|| options.parseJSON
			|| operationName.startsWith("Mod")
			|| operationName.startsWith("Create")
			|| operationName.startsWith("Update")
		) {
			data = JSON.parse(resp.responseText);
			if (data.errors) {
				logger.err(data.errors.length + " errors for " + operationName, true, data.errors);
				multiErrorToast(data.errors);
			}
			if (resp.status !== 200) {
				logger.err("Variables: " + payload, true, variables);
				throw new RedditAPIError(resp.status, `Error fetching gql operation ${operationName} (status: ${resp.status})`, "GQL_ERROR", data);
			}
		}

		if (!options.parseJSON) {
			if (options.cache) setCache(cacheKey, resp.responseText);
			return resp.responseText as any;
		}

		if (options.cache) setCache(cacheKey, data.data);
		return data.data;
	})();

	// If caching is enabled, track this fetch to deduplicate concurrent identical requests
	if (options.cache) {
		inFlightRequests.set(cacheKey, fetchPromise);
		fetchPromise.finally(() => inFlightRequests.delete(cacheKey));
	}

	return fetchPromise;
};

(window as any).gqlFetch = gqlFetch;