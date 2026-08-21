import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger, showToast, ToastType } from "../../logging";
import { conversationsListing, postAndCommentsListing } from "./mappers/listing";

const logger = getLogger('genericListing');

export async function genericListingR2(
	url: string,
	params: Record<string, string>,
	fn: typeof postAndCommentsListing | typeof conversationsListing = postAndCommentsListing,
	anonymousAuth: boolean = false,
) {
	try {
		params.raw_json = '1';
		params.consent = 'true';
		if (!params.limit && !params.after) {
			params.limit = params.layout === 'card' ? '15' : '25';
		}
		url += "?" + new URLSearchParams(params);

		if (anonymousAuth) {
			showToast({
				kind: ToastType.Custom,
				text: "Note: this person has blocked you, so the content has been fetched from the API logged-out, meaning your actions like upvotes will be missing.",
			}, 10e3);
		}

		const { data } = await getREST(url, { anonymous: anonymousAuth });
		return {
			jsonResponse: JSON.stringify(
				await fn(data.children, data.after)
			),
			status: 200,
		}
	} catch (e) {
		logger.crt(`Error fetching listing ${url}: ${e}`, e);
		return {
			jsonResponse: e instanceof RedditAPIError ? e.rawPayload : '{"status":500,"message":"Error fetching listing"}',
			status: 500,
		}
	}
}


export async function arcticShiftListing(username: string, isPostPage: boolean, after?: string | null) {
	try {
		const pageSize = !after
			? isPostPage ? 10 : 20
			: isPostPage ? 25 : 50;

		const params: Record<string, string> = {
			author: username,
			limit: '' + pageSize,
			sort: 'desc',
		}

		if (after) {
			params.before = after;
		}
		if (isPostPage) {
			params.md2html = 'true';
		}

		const { data, error } = await (
			await fetch(
				`https://arctic-shift.photon-reddit.com/api/${isPostPage ? 'posts' : 'comments'}/search?${new URLSearchParams(params)}`
			)
		).json();

		if (error) {
			logger.err(`Error while fetching from arctic-shift: ${error}`);
			return {
				jsonResponse: JSON.stringify({
					error: 500,
					message: error,
				}),
				status: 500,
			}
		}

		showToast({
			kind: 2,
			text: `Fetched ${data.length} ${isPostPage ? 'posts' : 'comments'} for u/${username} from arctic-shift`
		});

		const lastItem = data.length === pageSize ? data[data.length - 1] : null;

		return {
			jsonResponse: JSON.stringify(
				await postAndCommentsListing(
					data.map((item: any) => ({
						kind: isPostPage ? 't3' : 't1',
						data: item,
					})),
					lastItem ? '' + lastItem.created_utc : null,
				).then(state => { logger.dbg("State:", state); return state; })
			), 
			status: 200,
		}
	} catch (e) {
		logger.crt(`Error fetching arctic-shift listing for ${JSON.stringify({ username, isPostPage })}: ${e}`, e);
		return {
			jsonResponse: e instanceof RedditAPIError ? e.rawPayload : '{"status":500,"message":"Error fetching listing"}',
			status: 500,
		}
	}
}

export const blockedByUserNames = new Set<string>();
export const isUserCurationActive = new Map<string, Promise<boolean>>();