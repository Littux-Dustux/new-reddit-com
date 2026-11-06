import type { CommentForestTreesFragmentFragment, PdsBasicPostInfoFragmentFragment, PostCommentsQuery_postInfoById } from "../../../../api/types/gql";
import { getState } from "../../../../main";
import { clientConfig } from "../../../../ui/settings";
import type { Comment } from "../../types/comment";
import type { Post } from "../../types/post";
import type { CommentsPageState, CommentTreeState } from "../../types/state";
import type { CommentPosition } from "../comments";
import { processAwards } from "./award";
import { convertGqlMediaAssets } from "./common";
import { getAuthorFlairFromGqlThing } from "./flair";
import { mapModerationInfoCommon } from "./moderationInfo";


export function addGqlCommentToState(
	state: CommentTreeState,
	tree: CommentForestTreesFragmentFragment['trees'][number],
	{ postId, subredditId, postAuthorId, appliedSort, maxDepth }: {
		postId: string,
		appliedSort: string,
		subredditId: string,
		postAuthorId: string | null | undefined,
		maxDepth: number
	}
): CommentPosition {
	const node = tree.node ?? tree.more;
	if (!node) {
		console.error('Invalid CommentTree data:', tree);
		throw new TypeError('tree.node and tree.more both are unavailable');
	}
	node.__typename ??= "More";
	if (node.__typename === "Comment" && !node.content)
		// @ts-ignore
		node.__typename = "DeletedComment";

	switch (node.__typename) {
		case "Comment":
			const author = node.authorInfo?.__typename === "Redditor" ? node.authorInfo : null;
			state.comments[node.id] = {
				...(node.awardings && processAwards(node.awardings)),
				...(node.moderationInfo && mapModerationInfoCommon(node.moderationInfo)),
				author: node.authorInfo?.name ?? '[deleted]',
				authorId: node.authorInfo?.id,
				authorIsBlocked: author?.isBlocked,
				bodyMD: node.content.markdown,
				created: Date.parse(node.createdAt) / 1000,
				collapsed: node.isInitiallyCollapsed,
				collapsedBecauseCrowdControl: node.moderationInfo?.isAutoCollapsedFromCrowdControl,
				collapsedReasonCode: node.initiallyCollapsedReason,
				depth: tree.depth,
				distinguishType: node.distinguishedAs === "MODERATOR" ? 'yes' : node.distinguishedAs?.toLowerCase(),
				deletedBy: node.removedByCategory === "DELETED" ? 'user' : null,
				editedAt: node.editedAt ? Date.parse(node.editedAt) / 1000 : null,
				id: node.id,
				isAdmin: node.removedByCategory === "REDDIT",
				isAuthorCakeday: author?.isCakeDayNow,
				isAuthorPremium: author?.isPremiumAvatarTreatment,
				isGildable: node.isGildable,
				isLocked: node.isLocked,
				isMod: node.distinguishedAs === "MODERATOR",
				isOp: node.authorInfo.id === postAuthorId,
				isRemoved: node.moderationInfo?.isRemoved,
				isSaved: node.isSaved,
				isStickied: node.isStickied,
				media: {
					// @ts-ignore
					mediaMetadata: convertGqlMediaAssets(node.content.richtextMedia),
					richtextContent: JSON.parse(node.content.richtext),
					rteMode: node.content.typeHint.toLowerCase(),
					type: "rtjson"
				},
				parentId: tree.parentId,
				permalink: node.permalink,
				postId,
				profileImage: author?.iconSmall.url,
				score: node.score,
				subredditId,
				voteState: node.voteState === "NONE" ? 0 : node.voteState === "UP" ? 1 : -1,
				next: null,
				prev: null,
			}
			return { type: "comment", id: node.id };

		case "DeletedComment":
			// Stupid Reddit decided to leave it out
			const id = `t1_${node.createdAt}`;
			state.comments[id] = {
				...(node.moderationInfo && mapModerationInfoCommon(node.moderationInfo)),
				author: "[deleted]",
				authorId: null,
				bodyMD: "[deleted]",
				collapsed: node.isInitiallyCollapsed,
				created: Date.parse(node.createdAt) / 1000,
				deletedBy: node.removedByCategory === "DELETED"
					? 'user'
					: node.removedByCategory === "MODERATOR"
						? 'moderator'
						: null,
				depth: tree.depth,
				id,
				isAdmin: node.removedByCategory === "REDDIT",
				isDeleted: true,
				isScoreHidden: true,
				media: {
					richtextContent: {
						document: node.removedByCategory === "REDDIT"
							? [{
								e: "par",
								c: [{ e: "text", t: "[ Removed by Reddit ]" }]
							}]
							: []
					},
					type: "rtjson",
				},
				parentId: tree.parentId,
				permalink: '/',
				postId,
				score: 0,
				subredditId,
				unrepliableReason: 'DELETED',
				voteState: 0,
				next: null,
				prev: null,
			}
			return { type: "comment", id };

		case "More":
			const data: AnyRecord = {
				numComments: node.count,
				depth: tree.depth,
				parentId: tree.parentId,
				postId,
				next: null,
				prev: null,
			}
			if (tree.depth >= maxDepth) {
				const id = `continueThread-${tree.parentId}`;
				data.id = id
				state.continueThreads[id] = data;
				return { type: 'continueThread', id };

			} else {
				const id = `moreComments-${tree.parentId}`;
				data.id = id;
				data.token = JSON.stringify([tree.depth, node.cursor, appliedSort]);
				state.moreComments[id] = data;
				return { type: 'moreComments', id };
			}
	}

	throw TypeError(`Unknown comment tree entry: ${JSON.stringify(tree)}`);
}


export function addGqlCommentForestToState(
	post: Post,
	commentTrees: CommentForestTreesFragmentFragment['trees'],
	state: CommentTreeState,
	currentDepth: number = 0,
	appliedSort = ''
): CommentTreeState {
	
	if (commentTrees[0] && commentTrees[0].depth < 0) {
		currentDepth = Math.abs(commentTrees[0].depth);
	}
	const order: CommentPosition[] = [];
	const additionalInfo = {
		postId: post.id,
		subredditId: post.belongsTo.id,
		postAuthorId: post.authorId,
		appliedSort,
		maxDepth: clientConfig.commentMaxDepth - currentDepth,
	}
	const subredditId = additionalInfo.subredditId;
	state.authorFlair[subredditId] ??= { '[deleted]': null };


	for (const tree of commentTrees) {
		const comment = tree.node?.__typename === "Comment" ? tree.node : null;
		if (comment?.authorFlair)
			state.authorFlair[subredditId][comment.authorInfo.name] ??= getAuthorFlairFromGqlThing(comment.authorFlair);

		tree.depth += currentDepth;
		order.push(addGqlCommentToState(state, tree, additionalInfo));
	}

	for (let i = 0; i < order.length; i++) {
		const currentPos = order[i] as CommentPosition;
		const currentComment = state[
			currentPos.type === "moreComments" ? "moreComments" : `${currentPos.type}s` as keyof CommentTreeState
		][currentPos.id] as Comment;

		currentComment.prev = order[i - 1] ?? null;
		currentComment.next = order[i + 1] ?? null;
	}

	state.commentLists[post.id] = {
		head: order[0] ?? null,
		tail: order[order.length-1] ?? null,
	};

	return state;
};