export type APIResponse<T> = { status: number } & (
	{ ok: true, data: T } | { ok: false, errors: ErrorDetails[] }
);

export interface ErrorDetails {
	message: string;
	code?: string;
	field?: string;
}

export interface AuthData {
	accessToken: string;
	expiresAt: number;
	loid: string;
	sessionTracker: string;
}

export interface Subreddit {
	id: number,
	name: string,
	icon: string | null
}
export type SubredditSort = 'best' | 'hot' | 'new' | 'rising' | 'gilded' |
            'top_hour' | 'top_day' | 'top_week' | 'top_month' | 'top_year' | 'top_all' |
            'controversial_hour' | 'controversial_day' | 'controversial_week' | 'controversial_month' | 'controversial_year' | 'controversial_all';

export type SubredditLayout = 'card' | 'classic' | 'compact' | 'search';

export interface PatchSubredditPrefInput {
	preferences: Partial<SubredditPrefInput>;
	subreddit: Subreddit
}
export interface SubredditPrefInput {
	sort?: SubredditSort;
	layout?: SubredditLayout;
	styles_enabled?: boolean;
}

export interface SubredditPref {
	sort?: string | undefined;
	layout?: string | undefined;
	stylesEnabled?: boolean | undefined;
}
export interface SubredditPrefResponse {
	id: number;
	userId: number;
	subreddit: Subreddit;
	prefs: SubredditPref;
}