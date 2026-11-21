import type { CommentForestTreesFragmentFragment, GetModSubredditFeedPostElementsQuery, PostsByIdsQuery_postsInfoByIds, SubredditFeedElementsQuery } from "../../../../api/types/gql";
import { getState } from "../../../../main";
import { flushAndLogFilterHits } from "../../../../features/filterReddit/filterLog";
import type { Post } from "../../types/post";
import type { SubredditListingStateBase, PostListingPageState, CommentListingPageState, CommentsPageState } from "../../types/state";
import { addR2SubredditToState } from "../subreddit";
import { addGqlCommentForestToState } from "./comment";
import { addGqlPostToState } from "./posts";
import { processModPermissionsGql } from "./subreddit";

export function postsListingGql(
	data: SubredditFeedElementsQuery['postFeed'] | GetModSubredditFeedPostElementsQuery['postFeed'],
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
		dist: 0,
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
		token: null,
		userFlair: {},
	};

	if (!data) return state;

	const feed = data.__typename === "Subreddit"
		? data.elements
		: data.__typename === "AdHocMultireddit"
			? data.posts
			: null;
	if (!feed) return state;

	state.dist = feed.edges.length;
	state.token = feed.pageInfo.endCursor ? atob(feed.pageInfo.endCursor) : null;

	addR2SubredditToState(state, subredditInfo, userFlairsV2, postFlairsV2);

	if (data.__typename === "Subreddit") {
		state.subredditPermissions = processModPermissionsGql(data);
		for (const { node } of data.elements.edges) {
			if (node && (node.__typename === "SubredditPost" || node.__typename === "ProfilePost" || node.__typename === "AdPost")) {
				state.postIds.push(node.id);
				if (node.isStickied) state.pinned.push(node.id);
				addGqlPostToState(node, data.id, state, 'sub');
			}
		};

	} else if (data.__typename === "AdHocMultireddit") {
		for (const { node } of data.posts.edges) {
			if (node && (node.__typename === "SubredditPost" || node.__typename === "ProfilePost" || node.__typename === "AdPost")) {
				state.postIds.push(node.id);
				if (node.isStickied) state.pinned.push(node.id);
				addGqlPostToState(node, null, state, 'sub');
			}
		};
	}

	flushAndLogFilterHits();
	return state;
}


export function makePostCommentsStateGql(
	{ post, postId, appliedSort, commentForest, structuredStyles, subredditInfo, preferences, postFlairsV2, userFlairsV2 }: {
		post: PostsByIdsQuery_postsInfoByIds | null,
		postId: string,
		appliedSort: string,
		commentForest: CommentForestTreesFragmentFragment,
		structuredStyles: AnyRecord | null,
		subredditInfo: AnyRecord | null,
		preferences?: any,
		postFlairsV2?: any[] | null,
		userFlairsV2?: any[] | null,
	},
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
		subredditPermissions: preferences,
	};

	addR2SubredditToState(state, subredditInfo, userFlairsV2, postFlairsV2);

	if (post) addGqlPostToState(post, subredditInfo?.name, state, null);
	else state.posts[postId] = getState().posts.models[postId] as Post;

	addGqlCommentForestToState(state.posts[postId] as Post, commentForest.trees, state, 0, appliedSort);

	return state;
}