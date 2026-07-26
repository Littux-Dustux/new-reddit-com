import { gqlFetch } from "../../api/gql";
import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { postAndCommentsListing } from "./mappers/listing";
import { convertUnavailableSubredditToGatewayError } from "./mappers/subreddit";

const logger = getLogger("subredditPostsPage");

export async function subredditPostsPage(subredditOrSubreddits: string, params: Record<string, any>) {
	const isAdhocMulti = subredditOrSubreddits.includes("+") || subredditOrSubreddits === "all";
	const shouldFetchSubreddit = !params.after && !isAdhocMulti;

	try {
		const subredditInfoGql = !shouldFetchSubreddit ? null : gqlFetch(
			"SubredditInfoByName",
			"6b9c1679e69097e1c6df364adc11183afe6e2b6545dd1c0c1cc8f7490448c3e5",
			{
				subredditName: subredditOrSubreddits,
				loggedOutIsOptedIn: true,
				filterGated: true,
				includeRecapFields: false,
				includeWelcomePage: false,
				includeDevvitData: false,
			}
		);

		const structuredStyles = shouldFetchSubreddit && params.include?.includes("structuredStyles")
			? getREST(`/api/v1/structured_styles/${subredditOrSubreddits}.json?raw_json=1`).catch(e => logger.err(e.message, true, e))
			: null;

		//const postFlairsV2 = !shouldFetchSubreddit ? null : getREST(`/r/${subreddits}/api/link_flair_v2.json?raw_json=1`).catch(() => {});
		//const userFlairsV2 = !shouldFetchSubreddit ? null : getREST(`/r/${subreddits}/api/user_flair_v2.json?raw_json=1`).catch(() => {});

		params.raw_json = '1';
		if (!params.after) params.limit = 25;
		const sort = params.sort || '';

		delete params.dist;
		delete params.sort;
		delete params.layout;


		const listingPromise = getREST(`/r/${subredditOrSubreddits}/${sort}.json?${new URLSearchParams(params)}`);
		const subredditInfoByName = (await subredditInfoGql)?.subredditInfoByName;
		if (shouldFetchSubreddit && (!subredditInfoByName || subredditInfoByName.__typename !== "Subreddit")) {
			const gatewayError = await convertUnavailableSubredditToGatewayError(subredditInfoByName);
			logger.dbg("Unavailable subreddit", { shouldFetchSubreddit, subredditInfoByName, gatewayError });
			return gatewayError;
		}

		const listing = await listingPromise;
		return {
			jsonResponse: JSON.stringify(
				await postAndCommentsListing(
					listing.data.children,
					listing.data.after,
					{
						gqlSubredditAboutInfo: subredditInfoByName,
						structuredStyles: await structuredStyles,
						//userFlairsV2: await userFlairsV2,
						//postFlairsV2: await postFlairsV2
					}
				)
			),
			status: 200
		}
	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status
			}
		} else {
			logger.crt(`Error fetching subreddit page: ${(e as any)?.message}`, e);
			throw e;
		}
	}
}