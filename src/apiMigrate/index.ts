import { getLogger } from "../logging/logger";
import { addInterceptor } from "../interceptor/xhr";

import { gqlMigrationInterceptor } from "./gql";
import { gatewayMigratorInterceptor } from "./gateway";
import { oauthPipeInterceptor } from "./oauth";


const logger = getLogger("apiMigrate");

export function initAPIMigratorInterceptors() {
	addInterceptor("gql.reddit.com", "POST", gqlMigrationInterceptor);
	addInterceptor("gateway.reddit.com", "GET", gatewayMigratorInterceptor);
	addInterceptor("oauth.reddit.com", "*", oauthPipeInterceptor);
	addInterceptor("/", "*", async () => "{}");

	logger.log("Initialized interceptors.");
}