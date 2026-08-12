import { getLogger } from "../logging";
import { getState } from "../main";
import { getLoidState } from "../state/utils";
import { convertHeadersStringToObject } from "../utils";

export let redditSession: string | undefined = undefined;
export let loid: string | undefined = undefined;

export const parseResponseAndStoreAuth = (headers: string | Record<string, string>) => {
	const responseHeaders = typeof headers === "string"
		? new Headers(convertHeadersStringToObject(headers))
		: new Headers(headers);

	const xRedditSession = responseHeaders.get("x-reddit-session");
	const xRedditLoid = responseHeaders.get("x-reddit-loid");

	if (xRedditLoid && loid !== xRedditLoid) {
		loid = xRedditLoid;
		getState().user.loid = getLoidState(xRedditLoid);
	}
	if (xRedditSession && redditSession !== xRedditSession) {
		redditSession = xRedditSession;
		getState().user.sessionTracker = xRedditSession;
	}
}


export const getRedditRequestHeaders = async (anonymous: boolean = false) => {
	const headers: Record<string, string> = {
		"Accept": "application/json",
		"Origin": "https://new.reddit.com",
		"Referer": "https://new.reddit.com/",
	}

	if (anonymous) {
		headers['Authorization'] = `Bearer ${await getAnonymousToken()}`;
	} else {
		headers['Authorization'] = `Bearer ${await window.getToken()}`;
		headers['x-reddit-loid'] = loid ?? window.loid;
		if (redditSession) headers['x-reddit-session'] = redditSession;
	}

	return headers;
}


type Token = {
	accessToken: string;
	expiresAt: number;
}

type TokenResponse = { error: null; data: Token; } | { error: string; data: null };

const logger = getLogger('api:helpers');
let cachedToken: Token = {
	accessToken: "",
	expiresAt: 0,
};

async function getAnonymousToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now()) {
		return cachedToken.accessToken;
	}

	const response = await fetch("/api/anonymous-token");
	const { error, data }: TokenResponse = await response.json();
	if (typeof error === "string") {
		throw logger.exception(`Error fetching anonymous token (status ${response.status}): ${error}`);
	}

	logger.log("Fetched new anonymous access token");
	cachedToken = data;
	return cachedToken.accessToken;
}

window.getAnonymousToken = getAnonymousToken;