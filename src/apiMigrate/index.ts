import { getLogger } from "../logging/logger";
import { addInterceptor } from "../interceptor/xhr";

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
	addInterceptor("/", "POST", relativePathHandler);
	addInterceptor("reddit-subreddit-uploaded-media.s3-accelerate.amazonaws.com", "POST", s3UploadPipeInterceptor);
	addInterceptor("reddit-uploaded-media.s3-accelerate.amazonaws.com", "POST", s3UploadPipeInterceptor);

	logger.log("Initialized interceptors.");
}