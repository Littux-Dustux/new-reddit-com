import type { PostPage, SubredditFilter, SubredditFilterStandalone } from "./types";
import { checkKeywordsNoRegex, getCachedRegex } from "./match";

export type SubredditFilterVars = {
	name: string;
	description?: string | null;
	isNsfw: boolean;
}

const subredditFilterCache = new Map<string, boolean>();

export function checkSubreddit(cond: SubredditFilter | SubredditFilterStandalone, data: SubredditFilterVars, currPage?: PostPage): boolean {
	const cacheKey = JSON.stringify([
		(cond as SubredditFilterStandalone).title
			? `${(cond as SubredditFilterStandalone).author}-${(cond as SubredditFilterStandalone).title}`
			: cond,
		data.name,
		currPage
	]);

	if (subredditFilterCache.has(cacheKey)) {
		return subredditFilterCache.get(cacheKey) as boolean;
	}

	const result = _checkSubreddit(cond, data, currPage);
	subredditFilterCache.set(cacheKey, result);
	return result;
}

function _checkSubreddit(cond: SubredditFilter | SubredditFilterStandalone, data: SubredditFilterVars, currPage?: PostPage): boolean {
	if (!cond.enabled) return false;

	if (typeof cond.nsfw === 'boolean') {
		if (cond.nsfw) {
			if (!data.isNsfw) return false;
		} else {
			if (data.isNsfw) return false;
		}
	}

	if (currPage && (
		!(cond as SubredditFilterStandalone).page ||
		!(cond as SubredditFilterStandalone).page.includes(currPage)
	)) return false;

	// Note: nameExact and nameIncludes are made lower case during load in match.ts
	const nameLowerCase = data.name.toLowerCase();
	if (cond.nameExact?.some(s => nameLowerCase === s)) return true;
	if (cond.nameIncludes?.some(s => nameLowerCase.includes(s))) return true;
	if (cond.nameRegex?.some(regex => getCachedRegex(regex).test(data.name))) return true;

	if (data.description) {
		if (cond.descKeywords && checkKeywordsNoRegex(cond.descKeywords, data.description)) return true;
		if (cond.descRegex?.some(regex => getCachedRegex(regex).test(data.name))) return true;
	}

	return false;
}