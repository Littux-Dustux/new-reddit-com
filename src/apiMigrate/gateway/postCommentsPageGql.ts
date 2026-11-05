import { gqlFetch } from "../../api/gql";
import { getREST } from "../../api/rest";
import { RedditAPIError } from "../../api/restErr";
import { getLogger } from "../../logging";
import { getState } from "../../main";
import { userPrefs } from "../../state/addIdentity";
import { errToStr } from "../../utils";
import { addGqlCommentForestToState } from "./mappers/gql/comment";
import { makePostCommentsStateGql } from "./mappers/gql/listing";
import { postAndCommentsListing } from "./mappers/listing";
import { fetchSubredditPageExtra } from "./utils";
import type { PostCommentsQuery, CommentSort, PostCommentsQueryVariables, PostsByIdsQuery, PostsByIdsQuery_postsInfoByIds, PostsByIdsQueryVariables, CommentForestTreesFragmentFragment, GetCommentByIdWithChildrenQuery, GetCommentByIdWithChildrenQueryVariables } from "../../api/types/gql";
import type { Post } from "./types/post";
import type { CommentsPageState } from "./types/state";

const logger = getLogger('postCommentsGql');
const fetchedPostIds = new Set<string>();

async function fetchPost(id: string): Promise<PostsByIdsQuery_postsInfoByIds> {
	fetchedPostIds.add(id);
	const data = await gqlFetch<PostsByIdsQuery, PostsByIdsQueryVariables>(
		'PostsByIds', '0e471495bcba33554b6c540b3cf1cae23dd5432a8b741dddc7fd6717dc2520a7',
		{
			ids: [id],
			includeSubredditInPosts: false,
			includeExtendedVideoAsset: true,
			includeDevvitData: true,
			includeCommunityStatus: false,
			includeVideoPlaybackInComments: true,
			includeUnavailablePostReason: true,
			includeIsAuthorBlocked: true,
			includePostContentPostHint: false,
			includePostContentThumbnailEnabled: false,
		}
	);
	const post = data.postsInfoByIds[0] as PostsByIdsQuery_postsInfoByIds | null;
	if (!post) {
		throw new RedditAPIError(404, 'Not Found');
	}
	if (post.__typename === "UnavailablePost") {
		logger.err(`${post.unavailableReason}: ${post.unavailableTitle}`);
		logger.err(post.unavailableMessage?.message as string);

		throw new RedditAPIError(451, post.unavailableTitle as string);
	};
	return post;
}

export async function postCommentsResponseGql(postId: string, focusedCommentId: string | undefined, params: Record<string, string>) {
	const postFromState = getState().posts.models[postId];
	const isProfile = postFromState
		? postFromState.belongsTo.type === "profile"
		: location.pathname.startsWith('/user/') || null;
	const subredditName = isProfile ? `u_${params.subredditName}` : params.subredditName;


	try {
		// Crosspost creation page
		if (params.truncate === '0') {
			params.id = postId;
			const listing = await getREST(`/api/info.json?raw_json=1&${new URLSearchParams(params)}`, { cookieAuth: true });
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


		let useCommentsChildrenQuery = false;
		const isPreload = params.truncate === '25' || !subredditName;
		const gqlVars = {
			sortType: (params.sort?.toUpperCase() as CommentSort) ?? undefined,
			maxDepth: 10,
			count: userPrefs?.num_comments ?? 100,
			includeIsGildable: true,
			includeVideoPlaybackInComments: true,
			includePremiumAvatarTreatment: true,
			focusedCommentContext: focusedCommentId ? { commentId: focusedCommentId } : undefined,
			numParents: 0,
			...(isPreload && {
				count: 25,
				truncate: 10,
				includeAwards: false
			}),
		}

		if (postFromState?.discussionType === "CHAT") gqlVars.sortType = "LIVE";
		if (focusedCommentId) {
			if (params.context) {
				useCommentsChildrenQuery = true;
				gqlVars.numParents = Number(params.context);
			} else {
				const commentFromState = getState().features.comments.models[focusedCommentId];
				if (commentFromState && commentFromState.depth < 10) {
					gqlVars.numParents = 4;
					gqlVars.maxDepth = 10;
				} else {
					useCommentsChildrenQuery = true;
				}
			}
		}


		const subredditPageExtra = subredditName && params.include?.includes("structuredStyles")
			? fetchSubredditPageExtra(subredditName, !isPreload, !isPreload)
			: null;
		const post = fetchedPostIds.has(postId) ? null : fetchPost(postId);
		let commentForest: CommentForestTreesFragmentFragment;
		if (useCommentsChildrenQuery) {
			const data = await gqlFetch<GetCommentByIdWithChildrenQuery, GetCommentByIdWithChildrenQueryVariables>(
				'GetCommentByIdWithChildren', '21877473f62d8a98010a2549c810803aef4d6a0f5598715bd78a90218b99df21',
				{ id: focusedCommentId as string, ...gqlVars }
			);
			commentForest = data.commentById?.children as CommentForestTreesFragmentFragment;
		} else {
			const data = await gqlFetch<PostCommentsQuery, PostCommentsQueryVariables>(
				'PostComments', '059182c64536c086b09c79e6aa4da72622a208a8c416a9aa9b61dcf8aada8d0c',
				{ id: postId, ...gqlVars }
			);
			commentForest = data.postInfoById?.commentForest as CommentForestTreesFragmentFragment;
		}


		return {
			jsonResponse: JSON.stringify(
				makePostCommentsStateGql({
					post: await post,
					postId,
					appliedSort: gqlVars.sortType,
					commentForest,
					...(subredditPageExtra
						? await subredditPageExtra
						: { structuredStyles: null, subredditInfo: null }
					),
				})
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
			logger.crt(`Error fetching ${params.truncate === '0' ? "crossposted post info" : "GraphQL post comments"}: ${errToStr(e)}`);
			throw e;
		}
	}
}

export const moreCommentsResponseGql = async (postId: string, payload: string) => {
	try {
		const [depth, cursor, sortType] = JSON.parse(payload) as [number, string, string];
		const data = await gqlFetch<PostCommentsQuery, PostCommentsQueryVariables>(
			'PostComments', '059182c64536c086b09c79e6aa4da72622a208a8c416a9aa9b61dcf8aada8d0c',
			{
				id: postId,
				after: cursor,
				sortType: sortType as CommentSort || undefined,
				maxDepth: 10,
				count: userPrefs?.num_comments ?? 100,
				includeIsGildable: true,
				includeVideoPlaybackInComments: true,
				includePremiumAvatarTreatment: true,
			}
		);
		const commentTrees = ((data.postInfoById as any).commentForest as CommentForestTreesFragmentFragment).trees;

		return {
			jsonResponse: JSON.stringify(
				addGqlCommentForestToState(getState().posts.models[postId] as Post, commentTrees, {
					authorFlair: {},
					commentLists: {},
					comments: {},
					moreComments: {},
					continueThreads: {},
				}, depth)
			),
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