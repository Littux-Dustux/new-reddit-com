import { gqlFetch } from "../../api/gql";
import { getREST, postREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { getState } from "../../main";
import { moreComments, postAndCommentsListing, postComments, type CommentsPageState } from "./mappers/listing";
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

		const subredditPageExtra = subredditName && params.include?.includes("structuredStyles")
			? fetchSubredditPageExtra(subredditName, !isProfile, Boolean(isProfile))
			: null;

		const listing = await getREST(
			`${subredditPrefix}/comments/${postID.slice(3)}/_/${(commentID?.slice(3)) ?? ''}.json?${
				new URLSearchParams({
					...params,
					//sr_detail: "1",
					always_include_media: "1",
					feature: "link_preview",
					profile_img: "1",
					threaded: "false",
					raw_json: "1",
					raw_media_syntax: "1",
					context: "3",
					//sort: "live",
					//truncate: "20",
					//depth: "6",
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
					}
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