import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger } from "../../logging";
import { postAndCommentsListing } from "./mappers/listing";
import { addPostToState } from "./mappers/posts";
import { addGqlSubredditToState, addR2SubredditToState, type SubredditState } from "./mappers/subreddit";
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
	};

	if (!subreddit) {
		return {
			jsonResponse: JSON.stringify(state),
			status: 200,
		}
	};

	const isProfile = subreddit.startsWith("u_");

	try {
		const subredditExtra = await fetchSubredditPageExtra(
			subreddit, include.includes("structuredStyles"), true
		);
		addR2SubredditToState(
			state, subredditExtra.subredditInfo, subredditExtra.userFlairsV2, subredditExtra.postFlairsV2
		);
		state.structuredStyles = subredditExtra.structuredStyles;
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