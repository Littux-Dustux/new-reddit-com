import { addPostToState } from "./posts";
import { processModPermissionsGql, processSubredditAboutInfoGql, processSubredditGql } from "./subreddit";
import { processSubredditPostFlairGql, processSubredditUserFlairGql } from "./flair";
import { addCommentToState, addCommentTreeToState, type CommentPosition } from "./comments";
import { fixR2CommentsMedia } from "../utils";

export interface StateBase {
	account: any;
	authorFlair: Record<string, Record<string, any>>;
	postFlair: Record<string, any>;
	posts: Record<string, any>;
	profiles: Record<string, any>;
	userFlair: Record<string, any>;
	subredditAboutInfo: Record<string, any>;
	subreddits: Record<string, any>;
}

export interface FlatListingStateBase extends StateBase {
	dist: number;
	pinned: string[];
	token: string | null;
}

export interface SubredditListingStateBase extends StateBase {
	features?: any;
	preferences?: any;
	structuredStyles?: any;
	subredditPermissions?: any;
}


export interface PostListingPageState extends FlatListingStateBase {
	postIds: string[];
	postInstances: Record<string, any>;
}

export interface CommentListingPageState extends FlatListingStateBase {
	commentIds: string[];
	comments: Record<string, any>;
}

export interface CommentsPageState extends SubredditListingStateBase {
	commentLists: Record<string, { head: CommentPosition; tail: CommentPosition }>;
	comments: Record<string, any>;
	continueThreads: Record<string, any>;
	moreComments: Record<string, any>;
	postMeta: null;
}

export interface ConversationsPageState extends PostListingPageState {
	commentLists: Record<string, { head: CommentPosition; tail: CommentPosition }>;
	comments: Record<string, any>;
	continueThreads: Record<string, any>;
	moreComments: Record<string, any>;
	extraComments: Record<string, ExtraComments>;
}



export async function postAndCommentsListing(
	things: Record<string, any>[],
	afterToken: string | null,
	{ gqlSubredditAboutInfo, structuredStyles, userFlairsV2, postFlairsV2 }: {
		gqlSubredditAboutInfo?: any,
		structuredStyles?: any,
		userFlairsV2?: any,
		postFlairsV2?: any
	} = {}
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
		preferences: null,
		profiles: {},
		structuredStyles: structuredStyles,
		subredditAboutInfo: {},
		subredditPermissions: null,
		subreddits: {},
		token: afterToken,
		userFlair: {},
	};

	if (gqlSubredditAboutInfo) {
		const id = gqlSubredditAboutInfo.id;
		state.subredditAboutInfo[id] = processSubredditAboutInfoGql(gqlSubredditAboutInfo);
		state.subreddits[id] = processSubredditGql(gqlSubredditAboutInfo);
		state.postFlair[id] = processSubredditPostFlairGql(gqlSubredditAboutInfo, postFlairsV2);
		state.userFlair[id] = processSubredditUserFlairGql(gqlSubredditAboutInfo, userFlairsV2);
		state.subredditPermissions = processModPermissionsGql(gqlSubredditAboutInfo);
	};

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



export async function postComments(post: Record<string, any>, commentsChildren: Record<string, any>[], structuredStyles: any = null, postWithDevvit: any) {
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
		preferences: null,
		continueThreads: {},
		subredditAboutInfo: {},
		structuredStyles,
		userFlair: {},
		subredditPermissions: null,
	};

	addPostToState(post, state, postWithDevvit);

	if (commentsChildren.length !== 0) {
		addCommentTreeToState(commentsChildren, post.name, state);
	}

	await fixR2CommentsMedia(state.comments);
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
		if (!post.children?.data.children) continue;

		addCommentTreeToState(post.children.data.children, post.name, state);

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
			addCommentTreeToState(post.collapsed_children.data.children, post.name, state, state.extraComments[id]);
		} else if (post.collapsed_children) {
			addCommentTreeToState(post.collapsed_children.data.children, post.name, state);
		}
	};

	await fixR2CommentsMedia(state.comments);
	console.debug("conversationsListing", state);
	return state;
}