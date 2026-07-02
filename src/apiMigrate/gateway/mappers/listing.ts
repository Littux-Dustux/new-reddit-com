import { processPost } from "./posts";
import { processModPermissionsGql, processSubreddit, processSubredditAboutInfo, processSubredditAboutInfoGql, processSubredditGql } from "./subreddit";
import { getAuthorFlairFromR2Thing, processSubredditPostFlair, processSubredditPostFlairGql, processSubredditUserFlair, processSubredditUserFlairGql } from "./flair";

export const processListing = (
	items: Record<string, any>[],
	afterToken: string,
	{ gqlSubredditAboutInfo, structuredStyles, userFlairsV2, postFlairsV2 }: {
		gqlSubredditAboutInfo?: any,
		structuredStyles?: any,
		userFlairsV2?: any,
		postFlairsV2?: any
		
	}
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
		structuredStyles,
		userFlair: {},
		subredditPermissions: null,
		preferences: null
	};

	if (gqlSubredditAboutInfo) {
		const id = gqlSubredditAboutInfo.id;
		state.subredditAboutInfo[id] = processSubredditAboutInfoGql(gqlSubredditAboutInfo);
		state.subreddits[id] = processSubredditGql(gqlSubredditAboutInfo);
		state.postFlair[id] = processSubredditPostFlairGql(gqlSubredditAboutInfo, postFlairsV2);
		state.userFlair[id] = processSubredditUserFlairGql(gqlSubredditAboutInfo, userFlairsV2);
		state.subredditPermissions = processModPermissionsGql(gqlSubredditAboutInfo);
	}

	const posts = state.posts;
	const postIds = state.postIds;

	for (const { data: post } of items) {
		postIds.push(post.name);
		posts[post.name] = processPost(post);

		if (post.crosspost_parent_list?.[0]) {
			const crossPost = post.crosspost_parent_list[0];
			const subId = crossPost.subreddit_id || "";
			posts[crossPost.name] = processPost(crossPost);

			state.authorFlair[subId] ??= {};
			state.authorFlair[subId][crossPost.author] = getAuthorFlairFromR2Thing(crossPost);

			if (crossPost.sr_detail) {
				state.subredditAboutInfo[subId] ??= processSubredditAboutInfo(crossPost.sr_detail);
				state.subreddits[subId] ??= processSubreddit(crossPost.sr_detail);
				state.postFlair[subId] ??= processSubredditPostFlair(crossPost.sr_detail);
				state.userFlair[subId] ??= processSubredditUserFlair(crossPost.sr_detail);
			}
		}

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