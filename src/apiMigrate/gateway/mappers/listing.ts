import { addPostToState } from "./posts";
import { addR2SubredditToState } from "./subreddit";
import { addGqlSubredditToState } from "./gql/subreddit";
import { addCommentToState, addCommentTreeToState, type CommentPosition } from "./comments";
import { fixR2CommentsMedia } from "../utils";
import type { SubredditListingStateBase, PostListingPageState, CommentListingPageState, CommentsPageState, ConversationsPageState } from "../types/state";
import type { GetDevvitPostDataQuery } from "../../../api/types/gql";

export async function postAndCommentsListing(
	things: Record<string, any>[],
	afterToken: string | null,
	{ subredditInfo, structuredStyles, preferences, userFlairsV2, postFlairsV2 }: {
		subredditInfo: any,
		structuredStyles: any,
		preferences?: any,
		userFlairsV2?: any,
		postFlairsV2?: any
	} = {
		subredditInfo: null,
		structuredStyles: null,
	}
) {
	const state: SubredditListingStateBase & PostListingPageState & CommentListingPageState = {
		account: null,
		authorFlair: {},
		commentIds: [],
		comments: {},
		dist: things.length,
		features: {},
		pinned: [],
		postFlair: {},
		postIds: [],
		postInstances: {},
		posts: {},
		preferences: preferences ?? null,
		profiles: {},
		structuredStyles: structuredStyles,
		subredditAboutInfo: {},
		subredditPermissions: null,
		subreddits: {},
		token: afterToken,
		userFlair: {},
	};

	addR2SubredditToState(state, subredditInfo, userFlairsV2, postFlairsV2);

	for (const { kind, data } of things) {
		if (kind === "t3") {
			state.postIds.push(data.name);
			if (data.pinned) state.pinned.push(postAndCommentsListing.name);
			addPostToState(data, state);

		} else if (kind === "t1") {
			state.commentIds.push(data.name);
			addCommentToState(data, state);
		}
	};

	if (state.commentIds.length) {
		await fixR2CommentsMedia(state.comments);
	};

	return state;
}



export async function postComments(
	post: Record<string, any>,
	commentsChildren: Record<string, any>[],
	{ structuredStyles, postWithDevvit, subredditInfo, preferences, postFlairsV2, userFlairsV2 }: {
		structuredStyles: AnyRecord | null,
		subredditInfo: AnyRecord | null,
		preferences?: any,
		postFlairsV2?: any[] | null,
		userFlairsV2?: any[] | null,
		postWithDevvit?: GetDevvitPostDataQuery['postInfoById'] | null,
	},
	shouldFixR2Comments: boolean,
) {
	const state: CommentsPageState = {
		account: null,
		authorFlair: {},
		commentLists: {},
		comments: {},
		features: null,
		moreComments: {},
		postFlair: {},
		postMeta: null,
		posts: {},
		profiles: {},
		subreddits: {},
		preferences,
		continueThreads: {},
		subredditAboutInfo: {},
		structuredStyles,
		userFlair: {},
		subredditPermissions: null,
	};

	addR2SubredditToState(state, subredditInfo, userFlairsV2, postFlairsV2);
	addPostToState(post, state, postWithDevvit);
	addCommentTreeToState(commentsChildren, post.name, state);

	if (shouldFixR2Comments) await fixR2CommentsMedia(state.comments);
	return state;
}

export async function moreComments(things: Record<string, any>[], postId: string) {
	const state = addCommentTreeToState(things, postId);

	await fixR2CommentsMedia(state.comments);
	return state;
}



export type ExtraComments = {
	depth: 0,
	id: `extraComments-${string}`,
	next: CommentPosition,
	numComments: 0,
	parentId: string,
	postId: string,
	prev: CommentPosition,
};

const truncText = (text: string, limit: number) => text.length > limit ? text.slice(0, limit) + "…" : text;
const printOrder = (order: [number, string, string][]) => order.map(([depth, id, body]) => `${'│'.repeat(depth)}[${depth}] ${id}: ${body ? truncText(body, 18) : '[deleted]'}`).join('\n');

export async function conversationsListing(things: any[], afterToken: string) {
	const state: ConversationsPageState = {
		account: null,
		authorFlair: {},
		commentLists: {},
		comments: {},
		continueThreads: {},
		dist: things.length,
		extraComments: {},
		moreComments: {},
		pinned: [],
		postFlair: {},
		postIds: [],
		postInstances: {},
		posts: {},
		profiles: {},
		subredditAboutInfo: {},
		subreddits: {},
		token: afterToken,
		userFlair: {},
	};

	for (const { data: post } of things) {
		state.postIds.push(post.name);
		if (post.pinned) state.pinned.push(post.name);

		addPostToState(post, state);
		const postChildren = post.children?.data.children;
		if (!postChildren) continue;

		const collapsedChildren = post.collapsed_children?.data.children;
		if (collapsedChildren) postChildren.push(...collapsedChildren);

		if (post.has_extra_comments) {
			const id: `extraComments-${string}` = `extraComments-${post.extra_comments_after}`;
			state.extraComments[id] = {
				depth: 0,
				id,
				numComments: 0,
				parentId: post.extra_comments_after,
				postId: post.name,
				prev: null,
				next: null,
			};
			addCommentTreeToState(postChildren, post.name, state, state.extraComments[id]);
		} else {
			addCommentTreeToState(postChildren, post.name, state);
		}
	};

	await fixR2CommentsMedia(state.comments);
	console.debug("Conversations state:", state);

	for (const postId of state.postIds) {
		const commentLists = state.commentLists[postId];
		if (!commentLists) continue;

		const orderAsc: [number, string, string][] = [];
		let nextItemPos = commentLists.head;
		while (nextItemPos) {
			const nextItem = nextItemPos.type === "comment" ? state.comments[nextItemPos.id] : state.extraComments[nextItemPos.id];
			if (!nextItem) {
				console.error(`Error: ${nextItemPos.id} not found in state for postId ${postId}`);
				break;
			}
			orderAsc.push([nextItem.depth, nextItemPos.id, nextItem.media?.richtextContent.document[0]?.c?.[0]?.t]);
			nextItemPos = nextItem.next;
		} 

		const orderDesc: [number, string, string][] = [];
		let prevItemPos = commentLists.tail;
		while (prevItemPos) {
			const prevItem = prevItemPos.type === "comment" ? state.comments[prevItemPos.id] : state.extraComments[prevItemPos.id];
			if (!prevItem) {
				console.error(`Error: ${prevItemPos.id} not found in state for postId ${postId}`);
				break;
			}
			orderDesc.push([prevItem.depth, prevItemPos.id, prevItem.media?.richtextContent.document[0]?.c?.[0]?.t]);
			prevItemPos = prevItem.prev;
		}

		console.debug(`commentLists[${postId}] ${JSON.stringify(commentLists)}\norder:\n\n${printOrder(orderAsc)}`);

		if (orderAsc.toString() !== orderDesc.reverse().toString()) {
			console.error(`commentLists[${postId}] order mismatch!`);
		}
	};
	return state;
}