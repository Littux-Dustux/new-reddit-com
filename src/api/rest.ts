// AI slop warning: I feeded Gemini Pro a JS request handler I made before.
// Gemini's one was unoptimized and parsed JSON multiple times. Claude cleaned up the crap, but it added its own slop
// It is fine now.

import { getCache, setCache } from "./caching";
import { getLogger } from "../logging";
import { convertHeadersStringToObject, errToStr, truncText } from "../utils";
import { getRedditRequestHeaders, parseResponseAndStoreAuth } from "./helpers";
import { isLoggedIn } from "../state";
import { parseRedditError, RedditAPIError, tryParseJson } from "./restErr";


export interface RequestOptions {
	method?: string;
	data?: any;
	headers?: Record<string, string>;
	/** If true, uses getCache/setCache. Only works for GET requests. */
	cacheMaxAge?: number | undefined;
	anonymous?: boolean;
	cookieAuth?: boolean;
	expectStatusCodes?: Set<number>;
}


const logger = getLogger('api:rest');
const defaultHeaders = {
	"Accept": "application/json",
	"Origin": "https://oauth.reddit.com",
	"Referer": "https://oauth.reddit.com/",
}

/**
 * Base function to make authenticated requests to oauth.reddit.com.
 */
export async function redditRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	options.anonymous ??= !isLoggedIn.value;

	const method = options.method || "GET";
	const isGet = method === "GET";

	const cacheKey = endpoint;
	const enableCache = isGet && typeof options.cacheMaxAge === "number" && options.cacheMaxAge >= -1;

	if (enableCache) {
		const cached = getCache(cacheKey, options.cacheMaxAge);
		if (cached) return cached as T;
	}

	const url = endpoint.startsWith("http") ? endpoint : `https://oauth.reddit.com${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

	const headers: Record<string, string> = {
		...(options.cookieAuth ? defaultHeaders : await getRedditRequestHeaders(options.anonymous)),
		...options.headers,
	};

	let requestData: string | undefined = undefined;
	if (options.data && !isGet) {
		if (options.data instanceof URLSearchParams) {
			headers["Content-Type"] = "application/x-www-form-urlencoded";
			requestData = options.data.toString();
		} else {
			headers["Content-Type"] = "application/json";
			requestData = JSON.stringify(options.data);
		}
	}

	// Execute Request via Tampermonkey GM.xmlHttpRequest (wrapped in gmFetch)
	let response: Tampermonkey.Response<any>, tries = 0;
	while (true) {
		try {
			response = await window.gmFetch({
				method: (method as any),
				url,
				headers,
				data: (requestData as any),
				anonymous: !options.cookieAuth,
				timeout: 32_000,
				redirect: "manual",
			});
			break;
		} catch (e: any) {
			if (e.statusText) {
				tries++;
				logger.err(`Error fetching URL "${truncText(endpoint, 32)}" (tries: ${tries}): ${errToStr(e)}`);
				if (tries > 20) {
					throw new RedditAPIError(0, e.statusText);
				}
			} else throw e;
		}
	}
	if (!options.cookieAuth) parseResponseAndStoreAuth(response.responseHeaders);

	if (response.status === 301) {
		const headers = new Headers(convertHeadersStringToObject(response.responseHeaders));
		throw new RedditAPIError(404, `Got redirect to "${headers.get('location')}"`, "NOT_FOUND");
	}
	logger.log(`${method} ${url.slice(0, 128)} (status: ${response.status}) ${requestData?.slice(0, 128)}`);

	const parsed = tryParseJson(response.responseText);
	const isErrorPayload = parsed?.json?.errors && Array.isArray(parsed.json.errors) && parsed.json.errors.length > 0;

	if (isErrorPayload || !parsed || (!options.expectStatusCodes?.has(response.status) && response.status >= 400)) {
		const err = parseRedditError(response, options, parsed);
		if (err) throw err;
	}

	const result = parsed ?? response.responseText;

	// Cache the successful result if requested
	if (enableCache) {
		setCache(cacheKey, result);
	}

	return result as T;
}

/**
 * Convenience method for GET requests with caching
 */
export async function getREST<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	return redditRequest<T>(endpoint, { method: "GET", ...options });
}

/**
 * Convenience method for POST requests
 */
export async function postREST<T = any>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
	return redditRequest<T>(endpoint, { method: "POST", data, ...options });
}

(window as any).redditRequest = redditRequest;
(window as any).getREST = getREST;
(window as any).postREST = postREST;