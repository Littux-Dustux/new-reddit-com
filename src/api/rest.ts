// AI slop warning: I feeded Gemini Pro a JS request handler I made before.
// Gemini's one was unoptimized and parsed JSON multiple times. Claude cleaned up the crap, but it added its own slop
// It is fine now.

import { getCache, setCache } from "./caching";
import { getLogger, showToast } from "../logging";

const logger = getLogger('api:rest');

// --- Custom Error Class ---

export class RedditAPIError extends Error {
	public status: number;
	public reason: string;
	public rawPayload: any;
	public fields?: string[];

	constructor(status: number, message: string, reason: string = "UNKNOWN_ERROR", rawPayload: any = null, fields?: string[]) {
		super(message);
		showToast({
			kind: 4,
			text: message
		}, 10000);
		this.name = "RedditAPIError";
		this.status = status;
		this.reason = reason;
		this.rawPayload = rawPayload;
		this.fields = fields ?? [];
	}
}

// --- Internal Error Parser ---

/**
 * Attempts to parse JSON from response text. Returns parsed object or null if invalid JSON.
 */
function tryParseJson(responseText: string): any | null {
	try {
		return JSON.parse(responseText);
	} catch {
		return null;
	}
}

/**
 * Normalizes the varying error structures returned by Reddit into a single RedditAPIError.
 */
function parseRedditError(status: number, responseText: string, parsed?: any): RedditAPIError {
	// Parse JSON if not already provided
	if (!parsed) {
		parsed = tryParseJson(responseText);
		if (!parsed) {
			// Handle <text/html> or empty responses (e.g., 503 Service Unavailable, 502 Bad Gateway)
			const trimmedResponse = responseText.trim().toLowerCase();
			const isHtml = trimmedResponse.startsWith("<!doctype html") || trimmedResponse.startsWith("<html");
			const message = isHtml
				? `Reddit returned an HTML page (status: ${status})`
				: `Reddit returned a non JSON response (status: ${status}): ${responseText.slice(0, 100)}`;
			return new RedditAPIError(status, message, "HTML_OR_TEXT_ERROR", responseText);
		}
	}

	// 1. Format: { json: { errors: [ [reason, message, field], ... ] } }
	// Note: Reddit sometimes returns HTTP 200 OK with this format!
	if (parsed?.json?.errors && Array.isArray(parsed.json.errors) && parsed.json.errors.length > 0) {
		const firstError = parsed.json.errors[0];
		// firstError is usually an array: ["USER_REQUIRED", "Please log in to do that.", "username"]
		const reason = firstError[0] || "UNKNOWN_REASON";
		const message = firstError[1] || "An error occurred";
		const field = firstError[2];
		return new RedditAPIError(status, `${reason}: "${message}" on field "${field}"`, reason, parsed, field ? [field] : undefined);
	}

	// 2. Format: {"fields": ["subject"], "explanation": "we need something here", "message": "Bad Request", "reason": "NO_TEXT"}
	if (parsed?.explanation && parsed?.reason) {
		return new RedditAPIError(
			status,
			`${status}: ${parsed.message}: ${parsed.reason}: "${parsed.explanation}" on field(s) "${parsed.fields}"`,
			parsed.reason, parsed, parsed.fields
		);
	}

	// 3. Format: { reason: "MAY_NOT_VIEW", message: "Forbidden" }
	// 4. Format: { error: 403, message: "Forbidden", reason: "gold_only" }
	// 5. Format: { error: 404, message: "Not Found" }
	if (parsed?.message) {
		const actualStatus = parsed.error && typeof parsed.error === "number" ? parsed.error : status;
		const reason = parsed.reason || (parsed.error && typeof parsed.error === "string" ? parsed.error : "UNKNOWN_REASON");
		return new RedditAPIError(
			actualStatus,
			`${actualStatus}: ${parsed.message}${parsed.reason ? `: ${parsed.reason.replaceAll('_', ' ')}` : ""}`,
			reason, parsed
		);
	}

	// Fallback for unrecognized JSON objects
	return new RedditAPIError(status, `${status}: Unknown JSON error`, "UNKNOWN_JSON_ERROR", parsed);
}

// --- API Client ---

export interface RequestOptions {
	method?: string;
	data?: any;
	headers?: Record<string, string>;
	/** If true, uses getCache/setCache. Only works for GET requests. */
	cacheMaxAge?: number;
}

/**
 * Base function to make authenticated requests to oauth.reddit.com.
 */
export async function redditRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	const method = options.method || "GET";
	const isGet = method === "GET";

	// Check Cache first (if applicable)
	const cacheKey = endpoint;
	if (isGet && typeof options.cacheMaxAge === "number" && options.cacheMaxAge >= -1) {
		const cached = getCache(cacheKey, options.cacheMaxAge);
		if (cached) return cached as T;
	}

	// Prepare URL
	const url = endpoint.startsWith("http") ? endpoint : `https://oauth.reddit.com${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

	// Get Auth Token
	const token = await window.getToken();
	if (!token) {
		throw new RedditAPIError(401, "No authentication token available", "NO_TOKEN");
	}

	// Prepare headers and data
	const headers: Record<string, string> = {
		Authorization: `Bearer ${token}`,
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
	const response = await window.gmFetch({
		method: (method as any),
		url,
		headers,
		data: (requestData as any),
		anonymous: true
	});

	logger.log(`${method} ${url.slice(0, 128)} (status: ${response.status}) ${requestData?.slice(0, 128)}`);

	// Parse response once at the beginning
	const parsed = tryParseJson(response.responseText);

	// Detect if Reddit returned an error format in the body (even if HTTP status is 200 OK)
	const isErrorPayload = parsed?.json?.errors && Array.isArray(parsed.json.errors) && parsed.json.errors.length > 0;

	// Throw normalized error if HTTP error OR if body contains Reddit's custom error arrays
	if (response.status >= 400 || isErrorPayload) {
		throw parseRedditError(response.status, response.responseText, parsed);
	}

	// Use parsed result if available, otherwise fall back to raw text
	const result = parsed ?? response.responseText;

	// Cache the successful result if requested
	if (isGet && options.cacheMaxAge !== undefined && options.cacheMaxAge >= -1) {
		setCache(cacheKey, result);
	}

	return result as T;
}

/**
 * Convenience method for GET requests with caching
 */
export async function getREST<T = any>(endpoint: string, cacheMaxAge: number = 0): Promise<T> {
	return redditRequest<T>(endpoint, { method: "GET", cacheMaxAge });
}

/**
 * Convenience method for POST requests
 */
export async function postREST<T = any>(endpoint: string, data: any): Promise<T> {
	return redditRequest<T>(endpoint, { method: "POST", data });
}