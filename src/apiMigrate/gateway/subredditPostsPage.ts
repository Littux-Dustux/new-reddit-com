import { getUserSubredditPref } from "../../api/localhost";
import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { postAndCommentsListing } from "./mappers/listing";
import { expectStatusCodes, fetchSubredditPageExtra } from "./utils";

const logger = getLogger("subredditPostsPage");
const adhocMultiNames = new Set(["all", "popular", "mod", "friends"])

export async function subredditPostsPage(subredditOrSubreddits: string, params: Record<string, string>) {
	const isAdhocMulti = adhocMultiNames.has(subredditOrSubreddits) || subredditOrSubreddits.includes("+");
	const shouldFetchSubreddit = !params.after && !isAdhocMulti;
	const includeStructuredStyles = params.include?.includes("structuredStyles") ?? false;

	const prefs = await getUserSubredditPref(subredditOrSubreddits);
	const [sortPref, t] = prefs?.sort ? prefs.sort.split("_", 2) : [];
	const sort = params.sort ?? sortPref ?? '';
	if (prefs) {
		prefs.layout ??= params.layout;
	}

	if (t) params.t ??= t;
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
			getREST(`/r/${subredditOrSubreddits}/${sort}.json?${new URLSearchParams(params)}`,
				{ expectStatusCodes }
			).catch(e => {
				if (!shouldFetchSubreddit) throw e;
			}),
			shouldFetchSubreddit
				? fetchSubredditPageExtra(subredditOrSubreddits, includeStructuredStyles)
				: undefined,
		]);

		if (subredditPageExtra) {
			subredditPageExtra.preferences = prefs;
		}

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