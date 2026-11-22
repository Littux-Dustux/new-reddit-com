import { clientConfig } from "../settings";
import type { SubredditFilter } from "./types";

const regexCache = new Map<string | string[], RegExp>();
const REGEX_REGEX = /^\/([\s\S]*)\/([dgimsuvy]*)$/;
const KEYWORDS_ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;


function parseRegexInput(input: string) {
	const match = input.match(REGEX_REGEX);
	if (!match) {
		// Plain string without surrounding slashes: default to case-insensitive ('i')
		return new RegExp(input, 'i');
	}

	const [, pattern, flags] = match as [string, string, string | undefined];
	return new RegExp(pattern, flags);
}


export function getCachedRegex(pattern: string): RegExp {
	if (regexCache.has(pattern)) {
		return regexCache.get(pattern) as RegExp;
	}

	try {
		const regex = parseRegexInput(pattern);
		regexCache.set(pattern, regex);
		return regex;
	} catch (e: any) {
		throw new Error(`Error parsing regex '${pattern}': ${e.message}`);
	}
}


export function checkKeywordsNoRegex(keywords: string[], text: string): boolean {
	if (regexCache.has(keywords)) {
		return (regexCache.get(keywords) as RegExp).test(text);
	}

	const escapedKeywords = keywords.map(keyword => keyword.replace(KEYWORDS_ESCAPE_REGEX, '\\$&'));
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