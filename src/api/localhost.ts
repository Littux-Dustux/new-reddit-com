import { getLogger } from "../logging";
import { getState } from "../main";
import type { APIResponse, AuthData, ErrorDetails, PatchSubredditPrefInput, SubredditPref, SubredditPrefInput, SubredditPrefResponse } from "./types/localhost";

export class APIError extends Error {
	public status: number;
	public errors: ErrorDetails[];

	constructor(status: number, errors: ErrorDetails[]) {
		super(`API request failed with status ${status}: ${errors.map(e => e.message).join("; ")}`);
		this.status = status;
		this.errors = errors;
	}
}

async function request<T>(method: string, url: string, body?: any): Promise<T> {
	const options: RequestInit = { method, credentials: 'include' };
	if (body) {
		options.body = JSON.stringify(body);
		options.headers = { 'Content-Type': 'application/json' };
	}

	const resp = await fetch(url, options);
	const contentType = resp.headers.get('Content-Type');
	if (contentType && contentType.includes('application/json')) {
		const data = await resp.json() as APIResponse<T>;
		if (resp.ok && data.ok) {
			return data.data;
		} else {
			throw new APIError(data.status, 'errors' in data ? data.errors : []);
		}
	} else {
		throw new APIError(resp.status, [{ message: `Invalid response from server of type ${contentType}` }]);
	}
}

export const getAnonymousToken = (): Promise<AuthData> => request<AuthData>('GET', '/api/anonymous-token');

export const convertFullnameToNum = (id: string) => parseInt(id.slice(3), 36);

const cachedPrefs = new Map<string, SubredditPref>;

export const getUserSubredditPref = (srName: string): SubredditPref | Promise<SubredditPref | void> =>
	cachedPrefs.get(srName.toLowerCase()) ?? request<SubredditPrefResponse>(
		'GET', `/api/prefs/subreddit/${srName}`
	).then(data => data.prefs).catch(e => {
		if (!(e instanceof APIError)) throw e;
	});

export const upsertUserSubredditPref = (input: PatchSubredditPrefInput): Promise<SubredditPrefResponse> =>
	request<SubredditPrefResponse>(
		'PATCH', `/api/prefs/subreddit/${input.subreddit.name}`, input
	).then(data => {
		cachedPrefs.set(data.subreddit.name.toLowerCase(), data.prefs);
		return data;
	})