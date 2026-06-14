import type { InterceptorHandler } from "../../interceptor/xhr";
import { getLogger } from "../../logging/logger";
import { moreCommentsResponse, postCommentsResponse } from "./postCommentsPage";
import { subredditPostsPage } from "./subredditPostsPage";


const logger = getLogger("gatewayAPI");

export const gatewayMigratorInterceptor: InterceptorHandler = async ({ url: target, method: string }, data) => {
	const url = new URL(target);
	const params = Object.fromEntries(url.searchParams.entries());
	const [operation, ...path] = url.pathname.split("/").slice(3);

	logger.log("Intercepted request to gateway API: " + operation + " " + url, true);
	if (data) console.debug("Payload:", data);

	switch (operation) {
		case "subreddit":
		case "subreddits":
			return subredditPostsPage(path[0] as string, params);
		case "postcomments":
			return postCommentsResponse(path[0] as string, path[1], params);
		case "morecomments":
			// https://gateway.reddit.com/desktopapi/v1/morecomments/t3_1u4d7zb?emotes_as_images=true&rtj=only&redditWebClient=web2x&app=web2x-client-production&profile_img=true&allow_over18=1&include=identity
			// {"token":"orcih9a,orcjb7w,orcod95,orcykh8"}
			return moreCommentsResponse(path[0] as string, JSON.parse(data).token);
		default:
			logger.wrn("No handler for gateway API endpoint: " + url, true);
			return "{}";
	}
}