import { gqlFetch } from "../../../api/gql";
import { checkGqlPostFiltered } from "../../../features/filterReddit/checkPost";
import type { SubredditFilterVars } from "../../../features/filterReddit/checkSubreddit";
import { flushAndLogFilterHits } from "../../../features/filterReddit/filterLog";
import type { PostPage } from "../../../features/filterReddit/types";
import { fixAwardings } from "./award";
import { fixFlair } from "./flair";
import { convertShredditMediaRes } from "./media";

const validPostTypenames = new Set(['SubredditPost', 'ProfilePost', 'AdPost']);

export function fixGqlPost(node: any, currPage: PostPage = null, flattenRecs: boolean = false) {
	if (flattenRecs && node.__typename === "PostRecommendation") node = node.postInfo;
	if (!validPostTypenames.has(node.__typename)) return node;

	if (node.crosspostRoot?.post) {
		node.crosspostRoot.postInfo = fixGqlPost(node.crosspostRoot.post, currPage, false);
		delete node.crosspostRoot.post;
	}
	if (node.awardings) fixAwardings(node.awardings);
	if (node.flair?.template) fixFlair(node.flair);
	if (node.authorFlair?.template) fixFlair(node.authorFlair);
	if (node.media?.streaming) {
		const s = node.media.streaming;
		s.hlsUrl = s.hlsUrl.replace('cf.v', 'v');
		s.dashUrl = s.dashUrl.replace('cf.v', 'v');
	}

	const sub = node.__typename === "Subreddit" ? node.subreddit : node.profile;
	const subVars: SubredditFilterVars = {
		name: sub?.name ?? '',
		description: sub?.publicDescriptionText,
		isNsfw: sub?.isNsfw,
	}
	const isFiltered = checkGqlPostFiltered(node, subVars, currPage);
	if (isFiltered) {
		node.isHidden = true;
	}
	return node;
}


export function fixSvcGqlPost(node: any, currPage: PostPage) {
	if (node.postInfo) node = node.postInfo;
	if (!validPostTypenames.has(node.__typename)) return node;
	if (node.crosspostRoot?.postInfo) fixSvcGqlPost(node.crosspostRoot.postInfo, currPage);

	if (node.media) {
		const media = node.media;
		if (media.still) convertShredditMediaRes(media.still);
		if (media.animated) media.animated = {
			mp4_source: media.animated.variant
		}
		if (media.obfuscated) {
			media.obfuscatedStill = media.obfuscated;
			delete media.obfuscated;
			convertShredditMediaRes(media.obfuscatedStill);
		}
		if (media.streaming) {
			media.streaming.hlsUrl = media.streaming.url.replace('cf.v', 'v');
		}
	}
	if (node.gallery?.items) {
		node.gallery.items.forEach((it: any) => convertShredditMediaRes(it.media))
	}

	const sub = node.__typename === "Subreddit" ? node.subreddit : node.profile;
	if (sub) {
		sub.path = `/${sub.prefixedName}`;
	}
	const subVars: SubredditFilterVars = {
		name: sub?.name ?? '',
		description: sub?.publicDescriptionText,
		isNsfw: sub?.isNsfw,
	}
	const isFiltered = checkGqlPostFiltered(node, subVars, currPage);
	if (isFiltered) {
		node.isHidden = true;
	}
	return node;
}


export function fixGqlListing(connection: any, currPage: PostPage, fn = fixGqlPost, ...params: any[]) {
	for (const { node } of connection.edges) {
		if (node) fn(node, currPage, ...params);
	}
	flushAndLogFilterHits();
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
	//console.log(outputData);
	return JSON.stringify({
		data: outputData
	});
}

(window as any).fixSvcGqlPost = fixSvcGqlPost;