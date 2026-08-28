import { gqlFetch } from "../../api/gql";
import { getUserSubredditPref } from "../../api/localhost";
import { getREST, postREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { getState } from "../../main";
import { moreComments, postAndCommentsListing, postComments } from "./mappers/listing";
import { type CommentsPageState } from "./types/state";
import { fetchSubredditPageExtra } from "./utils";


const logger = getLogger('postComments');
const devvitDataCacheOptions = { cache: true, maxCacheAge: 300e3 };

export async function postCommentsResponse(postID: string, commentID: string | undefined, params: Record<string, string>) {
	const postFromState = getState().posts.models[postID];
	const isProfile = postFromState
		? postFromState.belongsTo.type === "profile"
		: location.pathname.startsWith('/user/') || null;

	const subredditPrefix = (isProfile === null || !params.subredditName) ? '' : (
		isProfile ? `/user/${params.subredditName}` : `/r/${params.subredditName}`
	);
	const subredditName = isProfile ? `u_${params.subredditName}` : params.subredditName;


	try {
		// Crosspost creation page
		if (params.truncate === '0') {
			params.id = postID;
			const listing = await getREST(`/api/info.json?raw_json=1&${new URLSearchParams(params)}`);
			return {
				jsonResponse: JSON.stringify({
					commentLists: {},
					continueThreads: {},
					moreComments: {},
					postMeta: null,
					...(await postAndCommentsListing(listing.data.children, null))
				} as CommentsPageState),
				status: 200,
			}
		}

		let postWithDevvit;

		if (!postFromState || postFromState.crosspostParentId || postFromState.thumbnail.url === "self" || postFromState.thumbnail.url === "default") {
			if (postFromState) {
				postWithDevvit = gqlFetch("GetDevvitPostData", "c1b617abd8eec6232ae0c97893316d44a2f09cb7cef56c646680b2d9de0d8802", {
					postId: postID,
					getCrossPost: Boolean(postFromState.crosspostParentId),
				}, devvitDataCacheOptions);
			} else {
				postWithDevvit = (async () => {
					const [post, postWithCrosspost] = await Promise.all([
						gqlFetch("GetDevvitPostData", "c1b617abd8eec6232ae0c97893316d44a2f09cb7cef56c646680b2d9de0d8802", {
							postId: postID,
							getCrossPost: false,
						}, devvitDataCacheOptions),
						gqlFetch("GetDevvitPostData", "c1b617abd8eec6232ae0c97893316d44a2f09cb7cef56c646680b2d9de0d8802", {
							postId: postID,
							getCrossPost: true,
						}, devvitDataCacheOptions)
					]);
					if (post?.postInfoById?.devvit?.__typename === "DevvitPost") {
						return post;
					} else {
						return postWithCrosspost;
					}
				})();
			}
		}

		const isPreload = params.truncate === '25';
		if (isPreload) {
			params.count = '25';
			params.truncate = '10';
		}

		const subredditPageExtra = !isPreload && subredditName && params.include?.includes("structuredStyles")
			? Promise.all([
				fetchSubredditPageExtra(subredditName, !isProfile, true),
				getUserSubredditPref(subredditName),
			]).then(([extra, prefs]) => {
				extra.preferences = prefs;
				return extra;
			}) : null;

		delete params.include;
		delete params.subredditName;
		delete params.hasSortParam;
		delete params.instanceId;
		delete params.onOtherDiscussions;
		delete params.comment_awardings_by_current_user;

		if (postFromState?.discussionType === "CHAT") params.sort = "live";
		if (commentID && !params.context) {
			params.context = '4';
			params.depth = '10';
		}

		const listing = await getREST(
			`${subredditPrefix}/comments/${postID.slice(3)}/_/${(commentID?.slice(3)) ?? ''}.json?${
				new URLSearchParams({
					...params,
					always_include_media: "1",
					feature: "link_preview",
					threaded: "false",
					raw_json: "1",
					raw_media_syntax: "1",
				})
		}`);


		return {
			jsonResponse: JSON.stringify(
				await postComments(
					listing[0].data.children[0].data,
					listing[1].data.children,
					{
						postWithDevvit:	(await postWithDevvit)?.postInfoById,
						...(subredditPageExtra
							? await subredditPageExtra
							: { structuredStyles: null, subredditInfo: null, isSubredditR2: false }
						),
					},
					!isPreload,
				)
			),
			status: 200
		};
	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status
			}
		} else if (e && (e as any).status && (e as any).jsonResponse) {
			return e as { jsonResponse: string, status: number };
		} else {
			logger.crt(`Error fetching ${params.onOtherDiscussions === "true" ? "other discussions" : "comments"}: ${
				(e as any)?.message ?? JSON.stringify(e)
			}`);
			throw e;
		}
	}
}

export const moreCommentsResponse = async (postID: string, childrenIDs: string) => {
	try {
		const data = await postREST(
			"/api/morechildren.json?raw_json=1&raw_media_syntax=1&profile_img=1&emotes_as_images=true&rtj=only&threaded=false&redditWebClient=web2x&app=web2x-client-production", 
			new URLSearchParams({
				link_id: postID,
				children: childrenIDs,
				api_type: "json",
			})
		);
		return {
			jsonResponse: JSON.stringify(await moreComments(data.json.data.things, postID)),
			status: 200
		};
	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status
			}
		} else throw e;
	}
}