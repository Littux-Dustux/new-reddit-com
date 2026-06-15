import { processPost } from "./posts";
import { getAuthorFlairFromR2Thing, processSubreddit, processSubredditAboutInfo, processSubredditAboutInfoGql, processSubredditGql, processSubredditPostFlair, processSubredditPostFlairGql, processSubredditUserFlair, processSubredditUserFlairGql } from "./subreddit";

export const processListing = (
	items: Record<string, any>[],
	afterToken: string,
	gqlSubredditAboutInfo?: any,
	structuredStyles?: any
) => {
	const state: Record<string, any> = {
		account: null,
		postIds: [],
		dist: items.length,
		features: {},
		subredditAboutInfo: {},
		authorFlair: {},
		subreddits: {},
		posts: {},
		postFlair: {},
		profiles: {},
		token: afterToken,
		postInstances: {},
		structuredStyles: gqlSubredditAboutInfo && structuredStyles ? structuredStyles : null,
		userFlair: {},
		subredditPermissions: null,
		preferences: null
	};

	if (gqlSubredditAboutInfo) {
		const id = gqlSubredditAboutInfo.id;
		state.subredditAboutInfo[id] = processSubredditAboutInfoGql(gqlSubredditAboutInfo);
		state.subreddits[id] = processSubredditGql(gqlSubredditAboutInfo);
		state.postFlair[id] = processSubredditPostFlairGql(gqlSubredditAboutInfo);
		state.userFlair[id] = processSubredditUserFlairGql(gqlSubredditAboutInfo);
		state.subredditPermissions = gqlSubredditAboutInfo.modPermissions;
	}

	const posts = state.posts;
	const postIds = state.postIds;

	for (const { data: post } of items) {
		postIds.push(post.name);
		posts[post.name] = processPost(post);

		const subId = post.subreddit_id || "";
		state.authorFlair[subId] ??= {};
		state.authorFlair[subId][post.author] = getAuthorFlairFromR2Thing(post);

		if (post.sr_detail) {
			state.subredditAboutInfo[subId] ??= processSubredditAboutInfo(post.sr_detail);
			state.subreddits[subId] ??= processSubreddit(post.sr_detail);
			state.postFlair[subId] ??= processSubredditPostFlair(post.sr_detail);
			state.userFlair[subId] ??= processSubredditUserFlair(post.sr_detail);
		}
	}

	return state;
}