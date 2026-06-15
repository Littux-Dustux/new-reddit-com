import { gqlFetch } from "../../api/gql";
import { getREST } from "../../api/rest";
import { getLogger } from "../../logging";
import { processListing } from "./mappers/listing";

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
			filterGated: false,
			includeRecapFields: false,
			includeWelcomePage: false,
			includeDevvitData: false,
		}
	);

	const structuredStyles = shouldFetchSubreddit && params.include.includes("structuredStyles")
		? getREST("/api/v1/structured_styles/"+subreddits+".json?raw_json=1").catch(e => logger.err(e.message, true, e))
		: null;

	params.raw_json = '1';
	params.limit = params.dist || '';
	const sort = params.sort || '';
	if (isAdhocMulti) params.sr_detail = "true";

	// console.debug({ isAdhocMulti, shouldFetchSubreddit, subredditInfoGql, structuredStylesGql, params: structuredClone(params) });

	delete params.dist;
	delete params.sort;
	delete params.layout;

	const listing = await getREST(`/r/${subreddits}/${sort}.json?${new URLSearchParams(params)}`);

	return JSON.stringify(
		processListing(
			listing.data.children,
			listing.data.after,
			(await subredditInfoGql)?.subredditInfoByName,
			await structuredStyles
		)
	)
}