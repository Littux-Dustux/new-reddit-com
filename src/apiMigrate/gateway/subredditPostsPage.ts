import { gqlFetch } from "../../api/gql";
import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { processListing } from "./mappers/listing";
import { convertUnavailableSubredditToGatewayError, structuredStylesLoadedSubs } from "./mappers/subreddit";

const logger = getLogger("subredditPostsPage");

export async function subredditPostsPage(subreddits: string, params: Record<string, any>) {
	const isAdhocMulti = subreddits.includes("+") || subreddits === "all" || subreddits === "mod" || subreddits === "friends";
	const shouldFetchSubreddit = !isAdhocMulti && !params.after;

	const subredditInfoGql = !shouldFetchSubreddit ? null : gqlFetch(
		"SubredditInfoByName",
		"6b9c1679e69097e1c6df364adc11183afe6e2b6545dd1c0c1cc8f7490448c3e5",
		{
			subredditName: subreddits,
			loggedOutIsOptedIn: true,
			filterGated: true,
			includeRecapFields: false,
			includeWelcomePage: false,
			includeDevvitData: false,
		}
	);

	const fetchStructuredStyles = shouldFetchSubreddit && (
		!structuredStylesLoadedSubs.has(subreddits.toLowerCase())
		|| params.include?.includes("structuredStyles")
	);
	const structuredStyles = fetchStructuredStyles
		? getREST(`/api/v1/structured_styles/${subreddits}.json?raw_json=1`).catch(e => logger.err(e.message, true, e))
		: null;

	if (fetchStructuredStyles) {
		structuredStylesLoadedSubs.add(subreddits.toLowerCase());
	}

	params.raw_json = '1';
	params.limit = params.dist || '';
	const sort = params.sort || '';
	if (isAdhocMulti) params.sr_detail = "true";

	// console.debug({ isAdhocMulti, shouldFetchSubreddit, subredditInfoGql, structuredStylesGql, params: structuredClone(params) });

	delete params.dist;
	delete params.sort;
	delete params.layout;


	const listingPromise = getREST(`/r/${subreddits}/${sort}.json?${new URLSearchParams(params)}`).catch(
		e => logger.err(`Error fetching listing: ${e.message}`, true, e)
	);
	const subredditInfoByName = (await subredditInfoGql)?.subredditInfoByName;
	if (shouldFetchSubreddit && (!subredditInfoByName || subredditInfoByName.__typename !== "Subreddit")) {
		const gatewayError = await convertUnavailableSubredditToGatewayError(subredditInfoByName);
		logger.dbg("Unavailable subreddit", { shouldFetchSubreddit, subredditInfoByName, gatewayError });
		return gatewayError;
	}

	const listing = await listingPromise;
	return {
		jsonResponse: JSON.stringify(
			processListing(
				listing.data.children,
				listing.data.after,
				subredditInfoByName,
				await structuredStyles
			)
		),
		status: 200
	}
}