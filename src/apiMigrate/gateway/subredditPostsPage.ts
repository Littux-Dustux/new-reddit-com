import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { postAndCommentsListing } from "./mappers/listing";
import { fetchSubredditPageExtra } from "./utils";

const logger = getLogger("subredditPostsPage");
const adhocMultiNames = new Set(["all", "popular", "mod", "friends"])
export async function subredditPostsPage(subredditOrSubreddits: string, params: Record<string, string>) {
	const isAdhocMulti = adhocMultiNames.has(subredditOrSubreddits) || subredditOrSubreddits.includes("+");
	const shouldFetchSubreddit = !params.after && !isAdhocMulti;
	const sort = params.sort || '';
	const includeStructuredStyles = params.include?.includes("structuredStyles") ?? false;

	params.raw_json = '1';
	params.limit = params.after // speed up initial load
		? params.layout === "card" ? '25' : '50'
		: params.layout === "card" ? '7' : '14';

	delete params.dist;
	delete params.sort;
	delete params.layout;
	delete params.include;

	try {
		const [listing, subredditPageExtra] = await Promise.all([
			getREST(`/r/${subredditOrSubreddits}/${sort}.json?${new URLSearchParams(params)}`),
			shouldFetchSubreddit
				? await fetchSubredditPageExtra(subredditOrSubreddits, includeStructuredStyles, true)
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