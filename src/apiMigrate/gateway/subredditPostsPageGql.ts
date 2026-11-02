import { gqlFetch } from "../../api/gql";
import { getUserSubredditPref } from "../../api/localhost";
import { RedditAPIError } from "../../api/restErr";
import type { GetModSubredditFeedPostElementsQuery, SubredditFeedElementsQuery, AdContextInput, FeedContextInput, GetModSubredditFeedPostElementsQueryVariables, PostFeedRange, PostFeedSort, SubredditFeedElementsQueryVariables } from "../../api/types/gql";
import { getLogger } from "../../logging";
import { getState } from "../../main";
import { errToStr } from "../../utils";
import { postsListingGql } from "./mappers/gql/listing";
import { subredditPostsPage } from "./subredditPostsPage";
import { fetchSubredditPageExtra } from "./utils";

const logger = getLogger("subredditPostsPageGql");
const adhocMultiNames = new Set(["all", "popular", "mod", "friends"])

export async function subredditPostsPageGql(subredditOrSubreddits: string, params: Record<string, string>) {
	if (adhocMultiNames.has(subredditOrSubreddits) || subredditOrSubreddits.includes('-'))
		return subredditPostsPage(subredditOrSubreddits, params);
	
	const isCombinedSr = subredditOrSubreddits.includes("+");
	const shouldFetchSubreddit = !params.after && !isCombinedSr;
	const includeStructuredStyles = params.include?.includes("structuredStyles") ?? false;
	
	const prefs = isCombinedSr ? null : await getUserSubredditPref(subredditOrSubreddits);
	const [sortPref, t] = prefs?.sort ? prefs.sort.split("_", 2) : [];
	const state = getState();
	const userPrefs = state.user.prefs;

	const sharedVariables = {
		adContext: {
			clientSignalSessionData: state.adsSignals,
			distance: params.distance,
			isAdPersonalizationAllowed: userPrefs.isAdPersonalizationAllowed,
			isThirdPartyAdPersonalizationAllowed: userPrefs.isThirdPartyAdPersonalizationAllowed,
			isThirdPartySiteAdPersonalizationAllowed: userPrefs.isThirdPartySiteAdPersonalizationAllowed,
			layout: params.layout?.toUpperCase() || undefined,
			referrer: document.referrer,
			recentSubreddits: state.recentSubreddits,
		} as AdContextInput,
		feedContext: {
			navigationSessionId: state.platform.currentPage?.locationState?.feedCorrelationId,
			isNsfwAllowed: !userPrefs.hideNSFW,
			layout: params.layout?.toUpperCase() || undefined,
		} as FeedContextInput,

		after: params.after ? btoa(params.after) : undefined,
		sort: (params.sort ?? sortPref)?.toUpperCase() as PostFeedSort || undefined,
		range: (t || params.t)?.toUpperCase() as PostFeedRange || undefined,
		pageSize: params.after // speed up initial load
			? params.layout === "card" ? 25 : 40
			: params.layout === "card" ? 7 : 14,
		includeSubredditInPosts: false
	};


	try {
		const [listing, subredditPageExtra] = await Promise.all([
			(isCombinedSr
			? gqlFetch<GetModSubredditFeedPostElementsQuery, GetModSubredditFeedPostElementsQueryVariables>(
				"GetModSubredditFeedPostElements",
				"94d567ae71014c1ec21204651e75ec11cc2d3e25a5c080e56c8593c3990b99b5",
				{
					...sharedVariables,
					subredditNames: subredditOrSubreddits.split('+'),
				}
			).then(d => d.postFeed)
			: gqlFetch<SubredditFeedElementsQuery, SubredditFeedElementsQueryVariables>(
				"SubredditFeedElements", 
				"6aeebc8d028901c2346fa8a0f4448a82db11ea29d649f69836a66fc48cc85fc6",
				{
					...sharedVariables,
					subredditName: subredditOrSubreddits,
					forceAds: undefined,
					feedFilters: undefined,
					optedIn: false,
				}
			).then(d => d.postFeed)
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
			jsonResponse: JSON.stringify(postsListingGql(listing as any, subredditPageExtra)),
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
			logger.crt(`Error fetching GQL subreddit page: ${errToStr(e)}`, e);
			throw e;
		}
	}
}