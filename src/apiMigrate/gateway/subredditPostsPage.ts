import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { postAndCommentsListing } from "./mappers/listing";
import { fetchSubredditPageExtra } from "./utils";

const logger = getLogger("subredditPostsPage");

export async function subredditPostsPage(subredditOrSubreddits: string, params: Record<string, string>) {
	const isAdhocMulti = subredditOrSubreddits.includes("+") || subredditOrSubreddits === "all";
	const shouldFetchSubreddit = !params.after && !isAdhocMulti;

	params.raw_json = '1';
	if (!params.after) params.limit = '15';
	const sort = params.sort || '';

	delete params.dist;
	delete params.sort;
	delete params.layout;

	try {
		const [listing, subredditPageExtra] = await Promise.all([
			getREST(`/r/${subredditOrSubreddits}/${sort}.json?${new URLSearchParams(params)}`),
			shouldFetchSubreddit
				? await fetchSubredditPageExtra(subredditOrSubreddits, params.include?.includes("structuredStyles"))
				: undefined,
		]);

		return {
			jsonResponse: JSON.stringify(
				await postAndCommentsListing(listing.data.children, listing.data.after, subredditPageExtra)
			),
			status: 200
		}

	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status
			}
		} else if (e && (e as any).status && (e as any).jsonResponse) {
			return e as { jsonResponse: string, status: number };
		} else {
			logger.crt(`Error fetching subreddit page: ${(e as any)?.message ?? JSON.stringify(e)}`, e);
			throw e;
		}
	}
}