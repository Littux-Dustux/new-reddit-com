import type { InterceptorHandler } from "../interceptor/xhr";
import { getLogger } from "../logging/logger";

const logger = getLogger("oauthPipe");

// Pipe the oauth.reddit.com requests through gmFetch
export const oauthPipeInterceptor: InterceptorHandler = async ({ url, method }, data = null) => {
	data: typeof data === "string" ? data : data && JSON.stringify(data);

	const response = await window.gmFetch({
		method: (method as any) || "GET",
		url,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Bearer ${await window.getToken()}`,
			Origin: "new.reddit.com",
			Referer: "https://www.reddit.com/r/ReturnNewReddit/",
		},
		data: data ?? undefined,
	});
	logger.dbg(`${method} ${url} (status: ${response.status}) ${data}`);
	return response.responseText;
}