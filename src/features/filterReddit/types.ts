export type PostPage =
	| "home"
	| "sub"
	| "user"
	| "saved"
	| "all"
	| "popular"
	| "search"
	| "privatePages" // upvoted, downvoted etc
	| null
	| undefined;

export interface PostFilter {
	enabled: boolean;
	title: string;
	author: string;
	keywords: string[];
	isRegex: boolean;
	surface: ("title" | "body" | "galleryCaption" | "postFlair" | "userFlair")[];
	// default: everything except 'saved', 'privatePages'
	page: PostPage[];
	subreddit: SubredditFilter | null;
	invertSubreddit: boolean;
	nsfw?: boolean;
}

export interface SubredditFilter {
	enabled: boolean;
	descRegex?: string[];
	descKeywords?: string[];
	nameRegex?: string[];
	nameExact?: string[];
	nameIncludes?: string[];
	nsfw?: boolean;
}

/* Only for standalone rules (not inside PostFilter) */
export interface SubredditFilterStandalone extends SubredditFilter {
	title: string;
	author: string;
	page: PostPage[];
}

export interface KeywordFilterSettings {
	fullyHideFilteredPosts: boolean; // Don't show "Post hidden (Unhide)" cards in feeds
	showToastOnFilter: boolean; // Show toast messages like "Filtered 2 posts by post filter 'Spoiler Free'"
	subreddits: SubredditFilterStandalone[];
	posts: PostFilter[];
}
