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

export const getRedditRequestHeaders = async () => ({
	"Accept": "application/json",
	"Authorization": "Bearer " + (await window.getToken()),
	"Origin": "https://new.reddit.com",
	"Referer": "https://new.reddit.com/",
	"x-reddit-loid": loid ?? window.loid,
	...(redditSession && {
		"x-reddit-session": redditSession
	})
})