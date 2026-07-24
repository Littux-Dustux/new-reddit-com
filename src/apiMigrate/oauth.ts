import { getRedditRequestHeaders, parseResponseAndStoreAuth, redditSession } from "../api/helpers";
import type { InterceptorHandler } from "./interceptXhr";
import { getLogger } from "../logging/logger";
import { getState } from "../main";
import { convertStateLoidToString } from "../state/utils";
import { convertHeadersStringToObject } from "../utils";

const logger = getLogger("oauthPipe");

// Pipe the oauth.reddit.com requests through gmFetch
export const oauthPipeInterceptor: InterceptorHandler = async ({ url, method, headers: requestHeaders }, data = null) => {
	//data: typeof data === "string" ? data : data && JSON.stringify(data);

	const headers: Record<string, string> = {
		...requestHeaders,
		...(await getRedditRequestHeaders())
	}

	if (redditSession) {
		logger.dbg("State user.sessionTracker === lastRedditSession:", getState().user.sessionTracker === redditSession);
		headers["x-reddit-session"] = redditSession;
	} else {
		delete headers["x-reddit-session"];
	}

	const response = await window.gmFetch({
		method: (method as any) || "GET",
		url,
		headers,
		data: data ?? undefined,
		anonymous: true
	});

	logger.log(`${method} ${url.slice(0, 128)} (status: ${response.status}) ${data?.slice(0, 128)}`);
	const responseHeaders = convertHeadersStringToObject(response.responseHeaders);
	parseResponseAndStoreAuth(requestHeaders);

	return {
		jsonResponse: response.responseText,
		status: response.status,
		headers: responseHeaders,
	};
}