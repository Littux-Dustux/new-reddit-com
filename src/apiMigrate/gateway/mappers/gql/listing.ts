import type { GetModSubredditFeedPostElementsQuery, SubredditFeedElementsQuery } from "../../../../api/types/gql";
import type { SubredditListingStateBase, PostListingPageState, CommentListingPageState } from "../../types/state";
import { addR2SubredditToState } from "../subreddit";
import { addGqlPostToState } from "./posts";
import { processModPermissionsGql } from "./subreddit";

const validPostTypenames = new Set(["SubredditPost", "ProfilePost", "AdPost"]);

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
			if (node && node.__typename !== "DeletedSubredditPost" && validPostTypenames.has(node.__typename)) {
				state.postIds.push(node.id);
				if (node.isStickied) state.pinned.push(node.id);
				addGqlPostToState(node, data.id, state);
			}
		};
	} else if (data.__typename === "AdHocMultireddit") {
		for (const { node } of data.posts.edges) {
			if (node && validPostTypenames.has(node.__typename)) {
				state.postIds.push(node.id);
				if (node.isStickied) state.pinned.push(node.id);
				addGqlPostToState(node, null, state);
			}
		};
	}

	return state;
}