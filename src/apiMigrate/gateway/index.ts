import type { InterceptorHandler } from "../interceptXhr";
import { getLogger } from "../../logging/logger";
import { moreCommentsResponse, postCommentsResponse } from "./postCommentsPage";
import { subredditPostsPage } from "./subredditPostsPage";
import { arcticShiftListing, blockedByUserNames, genericListingR2 } from "./listingPage";
import { conversationsListing } from "./mappers/listing";
import { getState } from "../../main";
import { duplicates, submitPage } from "./submitPage";


const logger = getLogger("gatewayAPI");
const emptyResponse = { jsonResponse: "{}", status: 501 };

export const gatewayMigratorInterceptor: InterceptorHandler = async ({ url: target, method: string }, data) => {
	const url = new URL(target);
	const params = Object.fromEntries(url.searchParams.entries());
	const [operation, onTarget, ...path] = url.pathname.split("/").slice(3) as [string, string, string, string];

	logger.dbg("Intercepted request to gateway API: " + operation + " " + url);
	if (data) console.debug("Payload:", data);

	switch (operation) {
		case "subreddit":
		case "subreddits":
			return subredditPostsPage(onTarget as string, params);
		case "postcomments":
			return postCommentsResponse(onTarget as string, path[0], params);
		case "morecomments":
			// https://gateway.reddit.com/desktopapi/v1/morecomments/t3_1u4d7zb?emotes_as_images=true&rtj=only&redditWebClient=web2x&app=web2x-client-production&profile_img=true&allow_over18=1&include=identity
			// {"token":"orcih9a,orcjb7w,orcod95,orcykh8"}
			return moreCommentsResponse(onTarget as string, JSON.parse(data).token);
		case "mod":
			return params.filtered === "true"
				? genericListingR2(`/me/f/mod/${params.sort}.json`, params)
				: genericListingR2(`/r/mod/${params.sort}.json`, params)
		case "user":
			const [endpoint, postId] = path;
			switch (endpoint) {
				case "conversations":
					return genericListingR2(`/user/${onTarget}/conversations.json`,
						params, conversationsListing, blockedByUserNames.has(onTarget.toLowerCase()),
					)
				case "morecomments":
					return genericListingR2(
						`/user/${onTarget}/more_comments/${postId}.json`,
						{ ...params, limit: '100' },
						conversationsListing,
						blockedByUserNames.has(onTarget.toLowerCase()),
					)
				case "comments":
					return onTarget?.toLowerCase() === getState().user.account?.displayText?.toLowerCase()
						? genericListingR2(
							`/user/${onTarget}/comments.json`,
							{ ...params, limit: '100' }
						)
						: arcticShiftListing(onTarget as string, false, params.after)
				case "posts":
					return onTarget?.toLowerCase() === getState().user.account?.displayText?.toLowerCase()
						? genericListingR2(`/user/${onTarget}/submitted.json`, params)
						: arcticShiftListing(onTarget as string, true, params.after)
				default:
					logger.wrn(`No handler for gateway user API endpoint ${path[0]}`, true);
					return {
						jsonResponse: "{}",
						status: 501
					};
			}

		// https://gateway.reddit.com/desktopapi/v1/submitpage?redditWebClient=web2x&app=web2x-client-production&allow_over18=1&include=identity%2CstructuredStyles%2CprefsSubreddit&subreddit=6TEEN
		case "submitpage":
			return submitPage(params);

		//https://gateway.reddit.com/desktopapi/v1/duplicates/1vn9637?allow_over18=1&include=&crossposts_only=true&sort=new&sr=6TEEN
		case "duplicates":
			return duplicates(onTarget as string, params);

		case "sidebar_insertion":
		case "comments_page_insertion":
			return emptyResponse;

		default:
			logger.wrn("No handler for gateway API endpoint: " + url, true);
			return emptyResponse;
	}
}