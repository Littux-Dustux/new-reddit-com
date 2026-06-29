import { getLogger } from "../logging/logger";
import { multiErrorToast } from "../logging/toast";
import { getCache, setCache } from "./caching";
import { RedditAPIError } from "./rest";

const logger = getLogger("api:gql");

export async function gqlFetch(
	operationName: string,
	sha256Hash: string,
	variables: any,
	options: { parseJSON?: boolean, cache?: boolean, maxCacheAge?: number } = { parseJSON: true, cache: false, maxCacheAge: 5 * 60_000 },
) {
	options.parseJSON ??= true;
	options.cache ??= false;
	options.maxCacheAge ??= 5 * 60_000;

	const payload = JSON.stringify(variables);
	const cacheKey = operationName + "~" + payload;

	if (options.cache) {
		const data = getCache(cacheKey, options.maxCacheAge);
		if (data) {
			if (typeof data === "string") {
				return options.parseJSON ? JSON.parse(data).data : data;
			} else {
				return options.parseJSON ? data : JSON.stringify({ data });
			}
		}
	}

	logger.log(`${operationName}: ${payload?.slice(0, 160)}`);

	const resp = await window.gmFetch({
		method: "POST",
		url: "https://gql-fed.reddit.com?" + operationName,
		headers: {
			"Accept": "application/json",
			"Authorization": "Bearer " + (await window.getToken()),
			"Content-Type": "application/json",
			"Origin": "https://new.reddit.com",
			"Referer": "https://new.reddit.com/",
			"X-Reddit-Loid": window.loid
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
	});

	if (resp.status !== 200) logger.err(`Status code ${resp.status} with ${operationName}`);

	let data: any;
	if (resp.status !== 200 || options.parseJSON) {
		data = JSON.parse(resp.responseText);
		if (data.errors) {
			logger.err(data.errors.length + " errors for " + operationName, true, data.errors);
			multiErrorToast(data.errors);
		}
		if (resp.status !== 200) {
			throw new RedditAPIError(resp.status, `Error fetching gql operation ${operationName} (status: ${resp.status})`, "GQL_ERROR", data);
		}
	}

	if (!options.parseJSON) {
		if (options.cache) setCache(cacheKey, resp.responseText);
		return resp.responseText;
	}

	if (options.cache) setCache(cacheKey, data.data);
	return data.data;
};