import type { KeywordFilterSettings } from "./filterReddit/types";

export interface ReturnNewRedditPrefs {
	version: number;

	// UI
	ui: {
		forceLightMode: boolean;
		commentMaxDepth: number;
		forcePostImgWidth: MediaQuality;
		disableAutoCollapseComments: boolean;
	};

	// Filter
	filter: KeywordFilterSettings;

	// API
	api: {
		useGraphQL: {
			subredditPage: boolean;
			postComments: boolean;
		};
		curationArcticComments: boolean;
		curationPosts: CurationPostsMode;
		fetchDevvitPostInfo: boolean;
	};

	// Enhancements
	enhancements: {
		mp4Gifs: boolean;
		commentVideoDownloads: boolean;
		saveScrollPosition: boolean;
		spaNavigation: boolean;
		revealBlockedComments: boolean;
	};

	// Debug
	debug: {
		experimentsOverride: Record<string, string>;
		toastMessages: { debug: boolean; info: boolean; log: boolean; warn: boolean; err: boolean };
		gqlFedTimeout: number;
		shredditGqlTimeout: number;
		restTimeout: number;
		giphyTimeout: number;
	};
}

export enum CurationPostsMode {
	ArcticShift = 0,
	RedditSearch = 1,
	Unchanged = 2,
}

export enum MediaQuality {
	Small = 0,
	Medium = 1,
	Large = 2,
	XLarge = 3,
	XXLarge = 4,
	XXXLarge = 5,
	Source = 6,
	SourceNoWebP = 7,
	Default = 8
}

export const clientConfig: ReturnNewRedditPrefs = {
	version: 2,

	ui: {
		forceLightMode: false,
		commentMaxDepth: 10,
		forcePostImgWidth: MediaQuality.Default,
		disableAutoCollapseComments: true,
	},

	filter: {
		fullyHideFilteredPosts: false,
		showToastOnFilter: true,
		subreddits: [],
		posts: [],
	},

	api: {
		useGraphQL: {
			subredditPage: false,
			postComments: true,
		},
		curationArcticComments: true,
		curationPosts: CurationPostsMode.RedditSearch,
		fetchDevvitPostInfo: true,
	},

	enhancements: {
		mp4Gifs: true,
		commentVideoDownloads: true,
		saveScrollPosition: false,
		spaNavigation: true,
		revealBlockedComments: true,
	},

	debug: {
		experimentsOverride: {},
		toastMessages: { debug: false, info: false, log: false, warn: true, err: true },
		gqlFedTimeout: 30e3,
		shredditGqlTimeout: 30e3,
		restTimeout: 35e3,
		giphyTimeout: 10e3,
	},
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


const storedConfig = localStorage.getItem("ReturnNewRedditPrefs");
if (storedConfig) {
	try {
		const parsedConfig: ReturnNewRedditPrefs = JSON.parse(storedConfig);
		const isGreaterThanSupported = parsedConfig.version > clientConfig.version;
		if (isGreaterThanSupported || !parsedConfig.version) {
			localStorage.removeItem("ReturnNewRedditPrefs");
			const msg = (
				'Sorry, your current configuration has been discarded. Reason: ' +
				(isGreaterThanSupported ? 'version greater than supported' : 'no version info')
			);
			console.error(msg);
			alert(msg);
		} else {
			setClientConfig(parsedConfig);
		}

	} catch (e: any) {
		const msg = "Failed to parse stored config:" + e.message;
		alert(msg);
		console.error(msg, e);
		localStorage.removeItem("ReturnNewRedditPrefs");
	}
}