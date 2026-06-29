import type { InterceptorHandler } from "../interceptor/xhr";
import { getLogger } from "../logging/logger";

const logger = getLogger("s3UploadPipe");

// Pipe the s3.amazon-aws.com requests through gmFetch
export const s3UploadPipeInterceptor: InterceptorHandler = async ({ url, method, headers }, data: FormData) => {
	//data: typeof data === "string" ? data : data && JSON.stringify(data);

	const response = await window.gmFetch({
		method: method as any,
		url,
		headers: {
			...headers,
			Origin: "new.reddit.com",
			Referer: "https://new.reddit.com/r/ReturnNewReddit/",
		},
		data: data,
		anonymous: false
	});
	logger.log(`${method} ${url} (status: ${response.status})}`);
	return {
		jsonResponse: response.responseText,
		status: response.status,
		headers: {
			"content-type": "application/xml; charset=utf-8",
		}
	};
}