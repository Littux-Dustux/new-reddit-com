import { clientConfig } from "../settings";
import type { SubredditFilter } from "./types";

const regexCache = new Map<string | string[], RegExp>();

export function getCachedRegex(pattern: string): RegExp {
	if (regexCache.has(pattern)) {
		return regexCache.get(pattern) as RegExp;
	}

	const regex = new RegExp(pattern);
	regexCache.set(pattern, regex);
	return regex;
}

export function checkKeywordsNoRegex(keywords: string[], text: string): boolean {
	if (regexCache.has(keywords)) {
		return (regexCache.get(keywords) as RegExp).test(text);
	}

	const escapedKeywords = keywords.map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	const regex = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'i');
	regexCache.set(keywords, regex);
	return regex.test(text);
}


function srFilterLowerCase(fil: SubredditFilter) {
	if (fil.nameExact) fil.nameExact = fil.nameExact.map(k => k.toLowerCase());
	if (fil.nameIncludes) fil.nameIncludes = fil.nameIncludes.map(k => k.toLowerCase());
}

clientConfig.filter.subreddits.forEach(srFilterLowerCase);
clientConfig.filter.posts.forEach(fil => {
	if (fil.subreddit) srFilterLowerCase(fil.subreddit)
});