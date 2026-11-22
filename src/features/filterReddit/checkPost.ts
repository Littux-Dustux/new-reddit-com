import type { GqlPostNonDeleted } from "../../apiMigrate/gateway/mappers/gql/posts";
import { getLogger } from "../../logging";
import { clientConfig } from "../settings";
import { checkSubreddit, type SubredditFilterVars } from "./checkSubreddit";
import { addFilterHit } from "./filterLog";
import { checkKeywordsNoRegex, getCachedRegex } from "./match";
import richtextToText from "./richtextToText";
import type { PostFilter, PostPage } from "./types";

type PostFilterVars = {
	title: string;
	body: string | undefined;
	galleryCaption: string | undefined;
	postFlair?: string;
	userFlair?: string;
	isNsfw: boolean;
};

const logger = getLogger('filterReddit:check');

export function checkPost(cond: PostFilter, postData: PostFilterVars, srData: SubredditFilterVars, currPage: PostPage): boolean {
	if (!cond.enabled || cond.keywords.length === 0) return false;
	if (!cond.page.includes(currPage)) return false;

	if (typeof cond.nsfw === 'boolean') {
		if (cond.nsfw) {
			if (!postData.isNsfw) return false;
		} else {
			if (postData.isNsfw) return false;
		}
	}
	if (cond.subreddit) {
		// Subreddit matches conditions
		if (checkSubreddit(cond.subreddit, srData)) {
			// invertSubreddit means that the check shouldn't run if subreddit matches
			// Useful to not run a filter on specific subreddits
			if (cond.invertSubreddit) return false;
		} else {
			// if invertSubreddit is false, the check requires that the subreddit is matched too
			// Useful to run a filter only on specific subreddits
			if (!cond.invertSubreddit) return false;
		}
	}
	return cond.surface.some(surface => {
		const text = postData[surface];
		if (!text) return false;

		if (cond.isRegex) {
			if (cond.keywords.some(r => getCachedRegex(r).test(text))) return true;
		} else {
			if (checkKeywordsNoRegex(cond.keywords, text)) return true;
		}
	})
}


export function checkR2PostFiltered(post: any, sub: SubredditFilterVars, currPage: PostPage): boolean {
	if (!clientConfig.filter.posts.length && !clientConfig.filter.subreddits.length) return false;

	const postData: PostFilterVars = {
		title: post.title,
		body: post.selftext ?? post.rtjson ? richtextToText(post.rtjson) : undefined,
		galleryCaption: post.gallery_data?.items?.map((item: any) => item.caption).filter((c: any) => c).join(" "),
		postFlair: post.link_flair_text,
		userFlair: post.author_flair_text,
		isNsfw: post.over_18,
	};
	return runPostFilters(postData, sub, currPage);
}

export function checkGqlPostFiltered(post: GqlPostNonDeleted, sub: SubredditFilterVars, currPage: PostPage): boolean {
	if (!clientConfig.filter.posts.length && !clientConfig.filter.subreddits.length) return false;

	const postData: PostFilterVars = {
		title: post.title ?? '',
		body: post.content?.markdown,
		galleryCaption: post.gallery?.items?.map(item => item.caption).filter((c: any) => c).join(" "),
		postFlair: post.flair?.text,
		userFlair: post.authorFlair?.text,
		isNsfw: post.isNsfw,
	};
	return runPostFilters(postData, sub, currPage);
}

/** @returns {boolean} Whether the post is filtered or not */
function runPostFilters(post: PostFilterVars, sub: SubredditFilterVars, currPage: PostPage): boolean {
	try {
		const filterHit = clientConfig.filter.subreddits.find(
			fil => checkSubreddit(fil, sub, currPage)
		) ?? clientConfig.filter.posts.find(
			fil => checkPost(fil, post, sub, currPage)
		);

		if (clientConfig.filter.showToastOnFilter && filterHit) addFilterHit(filterHit);
		return Boolean(filterHit);

	} catch (e: any) {
		clientConfig.filter.posts = [];
		clientConfig.filter.subreddits = [];
		logger.crt(`Error running post filters: ${e?.message}. All post filters have been disabled.`);
		return false;
	}
}