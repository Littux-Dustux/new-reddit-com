import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { postAndCommentsListing } from "./mappers/listing";
import { addPostToState } from "./mappers/posts";
import { addGqlSubredditToState, processSubreddit, processSubredditAboutInfo, type SubredditState } from "./mappers/subreddit";
import { fetchSubredditPageExtra } from "./utils";

const logger = getLogger('gateway:submitPage');

export async function submitPage({ include, subreddit }: any) {
	const state: SubredditState = {
		subredditAboutInfo: {},
		subreddits: {},
		subredditPermissions: {},
		postFlair: {},
		userFlair: {},
		structuredStyles: null,
	}

	if (subreddit.startsWith("u_")) {
		try {
			const { data } = await getREST(`/r/${subreddit}/about.json?raw_json=1`);
			state.subredditAboutInfo[data.name] = processSubredditAboutInfo(data);
			state.subreddits[data.name] = processSubreddit(data);
			return {
				jsonResponse: JSON.stringify(state),
				status: 200,
			}
		} catch(e) {
			if (e instanceof RedditAPIError) {
				return {
					jsonResponse: JSON.stringify({
						reason: e.status === 404 ? "NOT_FOUND" : e.status.toString().toUpperCase(),
						data: {},
					}),
					status: e.status,
				}
			} else {
				logger.crt(`Error fetching user subreddit submit page: ${(e as any)?.message ?? JSON.stringify(e)}`, e);
				throw e;
			}
		}
	}

	try {
		const subredditExtra = await fetchSubredditPageExtra(subreddit, include.includes("structuredStyles"));
		state.structuredStyles = subredditExtra.structuredStyles;
		addGqlSubredditToState(
			state, subredditExtra.gqlSubredditInfo, subredditExtra.userFlairsV2, subredditExtra.postFlairsV2
		);
		return {
			jsonResponse: JSON.stringify(state),
			status: 200,
		}
	} catch(e: any) {
		if (e && e.status && e.jsonResponse) {
			return e as { jsonResponse: string, status: number };
		} else {
			logger.crt(`Error fetching subreddit for submit page: ${(e as any)?.message ?? JSON.stringify(e)}`, e);
			throw e;
		}
	}
}

export async function duplicates(postId: string, params: Record<string, string>) {
	params.raw_json = '1';

	try {
		const [{ data: { children: [{ data: post }] } }, { data: { children, after }}] = await getREST(
			`/duplicates/${postId}.json?${new URLSearchParams(params)}`
		);

		const state = await postAndCommentsListing(children, after);
		addPostToState(post, state);

		return {
			jsonResponse: JSON.stringify(state),
			status: 200,
		}
	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status,
			}
		} else throw e;
	}
}