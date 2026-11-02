export interface ReturnNewRedditPrefs {
	// UI
	forceLightMode: boolean;

	// API
	useGraphQL: { subredditPage: boolean; [key: string]: boolean };
	curationArcticComments: boolean;
	curationPosts: CurationPostsMode;
	fetchDevvitPostInfo: boolean;

	// Enhancements
	mp4Gifs: boolean;
	commentVideoDownloads: boolean;
	saveScrollPosition: boolean;
	spaNavigation: boolean;
	revealBlockedComments: boolean;

	// Debug
	experimentsOverride: Record<string, string>;
	toastMessages: { debug: boolean; info: boolean; log: boolean; warn: boolean; err: boolean };
	gqlFedTimeout: number;
	shredditGqlTimeout: number;
	restTimeout: number;
	giphyTimeout: number;
}

export enum CurationPostsMode {
	ArcticShift = 0,
	RedditSearch = 1,
	Unchanged = 2,
}



export const clientConfig: ReturnNewRedditPrefs = {
	commentVideoDownloads: true,
	curationArcticComments: true,
	curationPosts: CurationPostsMode.RedditSearch,
	experimentsOverride: {},
	fetchDevvitPostInfo: true,
	forceLightMode: false,
	giphyTimeout: 10e3,
	gqlFedTimeout: 30e3,
	mp4Gifs: true,
	restTimeout: 35e3,
	revealBlockedComments: true,
	saveScrollPosition: false,
	shredditGqlTimeout: 30e3,
	spaNavigation: true,
	toastMessages: { debug: false, info: false, log: false, warn: true, err: true },
	useGraphQL: { subredditPage: false }
};

function setClientConfig(newConfig: Record<string, any>, currentConfig: Record<string, any> = clientConfig): void {
	for (const key in currentConfig) {
		if (newConfig[key] !== undefined) {
			if (typeof currentConfig[key] === "object" && !Array.isArray(currentConfig[key]) && currentConfig[key] !== null) {
				setClientConfig(newConfig[key], currentConfig[key]);
			} else {
				currentConfig[key] = newConfig[key];
			}
		}
	}
};

setClientConfig(
	JSON.parse(localStorage.getItem("ReturnNewRedditPrefs") as string) ?? {}
);