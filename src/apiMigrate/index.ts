import { getLogger } from "../logging/logger";
import { addInterceptor, type InterceptorHandler } from "./interceptXhr";

import { gqlMigrationInterceptor } from "./gql";
import { gatewayMigratorInterceptor } from "./gateway";
import { oauthPipeInterceptor } from "./oauth";
import { s3UploadPipeInterceptor } from "./aws";
import { relativePathHandler } from "./relativePath";


const logger = getLogger("apiMigrate");

export function initAPIMigratorInterceptors() {
	addInterceptor("gql.reddit.com", "POST", gqlMigrationInterceptor);
	addInterceptor("gateway.reddit.com", "*", gatewayMigratorInterceptor);
	addInterceptor("oauth.reddit.com", "*", oauthPipeInterceptor);
	addInterceptor("www.reddit.com", "*", pipeInterceptor);
	addInterceptor("/", "POST", relativePathHandler);
	addInterceptor("reddit-subreddit-uploaded-media.s3-accelerate.amazonaws.com", "POST", s3UploadPipeInterceptor);
	addInterceptor("reddit-uploaded-media.s3-accelerate.amazonaws.com", "POST", s3UploadPipeInterceptor);
	addInterceptor("reddit-uploaded-video.s3-accelerate.amazonaws.com", "POST", s3UploadPipeInterceptor);
	addInterceptor("reddit-uploaded-emoji.s3-accelerate.amazonaws.com", "POST", s3UploadPipeInterceptor);

	logger.log("Initialized interceptors.");
}

const pipeInterceptor: InterceptorHandler = async ({ url, method, headers: requestHeaders }, data = null) => {
	const response = await window.gmFetch({
		method: (method as any) || "GET",
		url,
		headers: requestHeaders,
		data: data ?? undefined,
		anonymous: false
	} as any);

	return {
		status: response.status,
		jsonResponse: response.responseText,
	}
}
