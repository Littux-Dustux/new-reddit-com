import type { InterceptorHandler } from "../../interceptor/xhr";
import { getLogger } from "../../logging/logger";
import { postCommentsResponse } from "./postcomments";


const logger = getLogger("gatewayAPI");

export const gatewayMigratorInterceptor: InterceptorHandler = async ({ url: target }) => {
	const url = new URL(target);
	const params = Object.fromEntries(url.searchParams.entries());
	const [operation, ...path] = url.pathname.split("/").slice(3);

	logger.log("Intercepted request to gateway API: " + operation + " " + path.join("/"), true);

	switch (operation) {
		case "postcomments":
			return postCommentsResponse(path[0] as string, path[1], params);
		default:
			logger.wrn("No handler for gateway API endpoint: " + operation, true);
			return "{}";
	}
}