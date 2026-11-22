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
	/** Title of the filter that shows up in the configuraion UI. Used for deduplication */
	title: string;
	/** Reddit username of the person who made the filter (shows up in UI). Used for deduplication. Set to 'me' by default */
	author: string;
	keywords: string[];
	/** Whether keywords are regex */
	isRegex: boolean;
	/** Where to run the checks */
	surface: ("title" | "body" | "galleryCaption" | "postFlair" | "userFlair")[];
	/** On what pages the filter should run (avoid "saved", "privatePages", and null by default) */
	page: PostPage[];
	/** Only run the rule if matching subreddit condition SubredditFilter */
	subreddit: SubredditFilter | null;
	/** Only run the rule if NOT matching subreddit condition  */
	invertSubreddit: boolean;
	/** Only run if post is NSFW/Not NSFW (undefined to skip check) */
	nsfw?: boolean;
}

export interface SubredditFilter {
	enabled: boolean;
	descRegex?: string[];
	/** Match keywords in description (case insensitive) */
	descKeywords?: string[];
	nameRegex?: string[];
	/** Name exact match (case insensitive) */
	nameExact?: string[];
	nameIncludes?: string[];
	/** Only run if subreddit is NSFW/Not NSFW (undefined to skip check) */
	nsfw?: boolean;
}

/* Only for standalone rules (not inside PostFilter) */
export interface SubredditFilterStandalone extends SubredditFilter {
	title: string;
	author: string;
	page: PostPage[];
}

export interface KeywordFilterSettings {
	/** Don't show "Post hidden (Unhide)" cards in feeds */
	fullyHideFilteredPosts: boolean;
	/** Show toast messages like "Filtered 2 posts by post filter 'Spoiler Free'" */
	showToastOnFilter: boolean;
	subreddits: SubredditFilterStandalone[];
	posts: PostFilter[];
}
