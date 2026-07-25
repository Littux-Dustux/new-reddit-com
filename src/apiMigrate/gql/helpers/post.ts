import { gqlFetch } from "../../../api/gql";
import { fixAwardings } from "./award";
import { fixFlair } from "./flair";

export function fixGqlPost(node: any) {
	if (node.__typename === "PostRecommendation") node = node.postInfo;
	if (node.crosspostRoot?.post) {
		node.crosspostRoot.postInfo = fixGqlPost(node.crosspostRoot.post);
		delete node.crosspostRoot.post;
	}
	if (node.awardings) fixAwardings(node.awardings);
	if (node.flair?.template) fixFlair(node.flair);
	if (node.authorFlair?.template) fixFlair(node.authorFlair);
	return node;
}

export function fixGqlListing(connection: any) {
	for (const { node } of connection.edges) {
		fixGqlPost(node);
	}
	return connection;
}

export function fixPopularElements(connection: any) {
	for (const edge of connection.edges) {
		if (edge.node.__typename === "PostRecommendation") {
			edge.node = edge.node.postInfo;
		}
		// iOS query lacks this, resulting in u/[deleted]
		const authorInfo = edge.node.authorInfo;
		if (authorInfo) {
			authorInfo.__typename = "Redditor";
			if (authorInfo.profile) {
				authorInfo.profile.__typename = "Profile"
			}
		}
		fixGqlPost(edge.node);
	}
	return connection;
}


export async function handlePostFeedAndOtherDiscussions({ postId, includeOtherDiscussions, includePostFeed, ...rest }: any) {
	const outputData: Record<string, any> = {};
	const promises = [];

	if (includeOtherDiscussions) {
		promises.push(gqlFetch(
			"GetDuplicatePosts",
			"fd557fdc121760c37dc2957d4cc103dd0eefa95926952c0adf6aad8afea1e54a",
			{
				id: postId,
				includeSubredditInPosts: true,
				...rest
			}
		).then(({ postInfoById }) => {
			if (!postInfoById) return;
			postInfoById.otherDiscussionsCount = postInfoById.otherDiscussions.edges.length;
			Object.assign(postInfoById.otherDiscussions, {
				"dist": postInfoById.otherDiscussions.edges.length,
				"pageInfo": { "hasNextPage": false, "hasPreviousPage": false, "startCursor": "dDNfdGVzdA==", "endCursor": "dDNfdGVzdA==" },
			});
			outputData.post = postInfoById;
		}));
	}

	/* if (includePostFeed) {
		promises.push(gqlFetch(
			"SubredditFeedElements",
			"6aeebc8d028901c2346fa8a0f4448a82db11ea29d649f69836a66fc48cc85fc6",
			{
				pageSize: 3,
				optedIn: true,
				includeSubredditInPosts: true,
				...rest
			}
		).then(({ postFeed: subreddit }) => {
			if (!subreddit) return;
			subreddit.posts = subreddit.elements;
			delete subreddit.elements;
			outputData.subreddit = subreddit;
		}))
	} */

	await Promise.all(promises);
	console.log(outputData);
	return JSON.stringify({
		data: outputData
	});
}