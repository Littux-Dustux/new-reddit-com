import { gqlFetch } from "../../api/gql";
import { getREST } from "../../api/rest";
import { processListing } from "./mappers/listing";

export async function subredditPostsPage(subreddits: string, params: Record<string, any>) {
	const isAdhocMulti = subreddits.includes("+");
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
	
	const structuredStylesGql = shouldFetchSubreddit && params.include.includes("structuredStyles") ? gqlFetch(
		"SubredditStructuredStyle",
		"5a788c93414bd669bf66b02900d1140e86a6e2bdd16fee0ec750e4fa6c60e189",
		{
			subredditName: subreddits,
			includeWidgets: true,
			includeCustomColors: true
		}
	) : null;
	
	params.raw_json = '1';
	params.limit = params.dist || '';
	const sort = params.sort || '';
	if (isAdhocMulti) params.sr_detail = "true";
	
	console.debug({ isAdhocMulti, shouldFetchSubreddit, subredditInfoGql, structuredStylesGql, params: structuredClone(params) });

	delete params.dist;
	delete params.sort;
	delete params.layout;

	const listing = await getREST(`/r/${subreddits}/${sort}.json?${new URLSearchParams(params)}`);

	return JSON.stringify(
		processListing(
			listing.data.children,
			listing.data.after,
			(await subredditInfoGql)?.subredditInfoByName,
			(await structuredStylesGql)?.subredditInfoByName
		)
	)
}