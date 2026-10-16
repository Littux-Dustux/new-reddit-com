import { showToast, ToastType } from "../logging";
import { gqlFetch } from "./gql";
import type { RequestOptions } from "./rest";

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


export function tryParseJson(responseText: string): any | null {
	try {
		return JSON.parse(responseText);
	} catch {
		return null;
	}
}

function stringifyReplacer(key: string, value: any) {
	if (typeof value === "object" && value !== null) {
		if (value instanceof Map) {
			return Array.from(value.entries());
		} else if (value instanceof Set) {
			return Array.from(value.values());
		}
    }
  	return value;
}

/**
 * Normalizes the varying error structures returned by Reddit into a single RedditAPIError.
 */
export function parseRedditError(response: Tampermonkey.Response<any>, requestOptions: RequestOptions, parsed: any): RedditAPIError | undefined {
	const { status, responseText } = response;

	if (!parsed) {
		// Handle <text/html> or empty responses (e.g., 503 Service Unavailable, 502 Bad Gateway)
		const trimmedResponse = responseText.trim().toLowerCase();
		if (trimmedResponse.includes("you've been blocked by network security")) {
			// Prevent info leak
			delete requestOptions.headers;

			const reqOptsStr = JSON.stringify(requestOptions, stringifyReplacer, "\t").split("\n").join("\n\t");

			showToast({
				kind: ToastType.Modal,
				text: "You've been blocked by Reddit!",
				customIconAsset: "https://i.redd.it/2b0n9lmpcvvh1.png",
				buttonText: "Report issue",
				buttonAction: async () => {
					const errText = `URL (status ${response.status}):\n\n\t${response.finalUrl}\n\nRequest options:\n\n\t${reqOptsStr}`;
					if (confirm("Ok to make a comment under https://redd.it/1x7lpr7 with this info?\n\n" + errText)) {
						const { createComment } = await gqlFetch(
							"CreateComment",
							"6b793908708a4ba5c774e0828a9659977b9aebad5f56a424ffe95b48057bf2e2",
							{
								input: {
									postId: "t3_1x7lpr7",
									content: {
										markdown: "Submitted from client: " + errText,
									}
								}
							}
						);

						if (!createComment?.ok) {
							prompt(
								"Error making comment: " +
								JSON.stringify(createComment.errors) + " " +
								JSON.stringify(createComment.fieldErrors) +
								"\n\nCopy the error text from below:",
								errText 
							)
						} else window.store.dispatch({
							type: "@@router/CALL_HISTORY_METHOD",
							payload: {
								method: "push",
								args: [createComment.commentInfo.permalink]
							}
						});
					}
				}
			}, 0);
			return new RedditAPIError(
				status,
				"Got HTML error page saying \"You've been blocked by network security\"",
				"BLOCKED_BY_REDDIT",
				responseText
			);
		}

		if (requestOptions.expectStatusCodes?.has(response.status)) return;

		const isHtml = trimmedResponse.startsWith("<!doctype html") || trimmedResponse.startsWith("<html");
		const message = isHtml
			? `Reddit returned an HTML page (status: ${status})`
			: `Reddit returned a non JSON response (status: ${status}): ${responseText.slice(0, 100)}`;
		return new RedditAPIError(status, message, "HTML_OR_TEXT_ERROR", responseText);
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

