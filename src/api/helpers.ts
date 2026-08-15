import { getLogger } from "../logging";
import { getState } from "../main";
import { isLoggedIn } from "../state";
import { getLoidState } from "../state/utils";
import { convertHeadersStringToObject } from "../utils";

export let redditSession: { value: string | null } = { value: null };
export let loid: { value: string | null } = { value: null };
let anonLoid: string | null = null;

export const parseResponseAndStoreAuth = (headers: string | Record<string, string>) => {
	const responseHeaders = typeof headers === "string"
		? new Headers(convertHeadersStringToObject(headers))
		: new Headers(headers);

	const xRedditSession = responseHeaders.get("x-reddit-session");
	const xRedditLoid = responseHeaders.get("x-reddit-loid");

	if (xRedditLoid && loid.value !== xRedditLoid) {
		loid.value = xRedditLoid;
		getState().user.loid = getLoidState(xRedditLoid);
	}
	if (xRedditSession && redditSession.value !== xRedditSession) {
		redditSession.value = xRedditSession;
		getState().user.sessionTracker = xRedditSession;
	}
}


export const getRedditRequestHeaders = async (anonymous: boolean = false) => {
	const headers: Record<string, string> = {
		"Accept": "application/json",
		"Origin": "https://new.reddit.com",
		"Referer": "https://new.reddit.com/",
	}

	headers['Authorization'] = `Bearer ${await (anonymous ? getAnonymousToken : window.getToken)()}`;

	if (!anonymous || !isLoggedIn.value) {
		headers['x-reddit-loid'] = loid.value ?? window.loid;
		if (redditSession.value) headers['x-reddit-session'] = redditSession.value;
	} else if (anonLoid) {
		headers['x-reddit-loid'] = anonLoid;
	}

	return headers;
}



type TokenResponse = { error: null; data: TokenResponseData; } | { error: string; data: null };
type TokenResponseData = {
	accessToken: string;
	expiresAt: number;
	loid: string;
	sessionTracker: string;
}

const logger = getLogger('api:helpers');
let cachedToken = {
	accessToken: "",
	expiresAt: 0,
};

export async function getAnonymousToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.accessToken;
	}

	const response = await fetch("/api/anonymous-token");
	const { error, data }: TokenResponse = await response.json();
	if (typeof error === "string") {
		throw logger.exception(`Error fetching anonymous token (status ${response.status}): ${error}`);
	}

	logger.log("Fetched new anonymous access token");
	cachedToken = {
		accessToken: data.accessToken,
		expiresAt: data.expiresAt,
	};

	if (!isLoggedIn.value) {
		window.tokenCache = {
			token: data.accessToken,
			expires: data.expiresAt,
		}
		if (!loid.value) {
			loid.value = data.loid;
			window.loid = data.loid;
			getState().user.loid = getLoidState(loid.value);
		}
		if (!redditSession.value) {
			redditSession.value = data.sessionTracker;
			getState().user.sessionTracker = data.sessionTracker;
		}
	} else {
		anonLoid = data.loid;
	};
	return cachedToken.accessToken;
}

window.getAnonymousToken = getAnonymousToken;