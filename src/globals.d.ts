declare interface Window {
	clientLoaded: boolean;
	loid: string;
	csrfToken: string;
	__MODREDDITCOM_REVIVED__: {
		version: number,
		useLocalhost: boolean,
		loadTrophyData: boolean,
		event: { detail: { accessToken: string }}
	};
	APICache: Map<any, { data: any, ts: number }>;
	tokenCache: { token: string, expires: number };
	gmFetch: (req: Tampermonkey.Request) => Promise<Tampermonkey.Response<any>>;
	getToken: () => Promise<string>;
	getAnonymousToken: () => Promise<string>;
	getRedditCookie: () => Promise<string>;
	store: {
		dispatch: (options: { type: string, payload?: any }) => void;
		getState: () => any;
		subscribe: (listener: () => void) => () => void;
	},
	addInterceptor: typeof addInterceptor;
	importRedditModule: (modulePath: string) => any;
}