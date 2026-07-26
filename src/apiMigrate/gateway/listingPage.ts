import { getREST, RedditAPIError } from "../../api/rest";
import { getLogger, showToast } from "../../logging";
import { conversationsListing, postAndCommentsListing } from "./mappers/listing";

const logger = getLogger('genericListing');

export async function genericListingR2(
	url: string,
	params: Record<string, string>,
	fn: typeof postAndCommentsListing | typeof conversationsListing = postAndCommentsListing,
) {
	try {
		params.raw_json = '1';
		if (!params.limit && !params.after) {
			params.limit = '25';
		}
		url += "?" + new URLSearchParams(params);

		const { data } = await getREST(url);
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
		const params: Record<string, string> = {
			author: username,
			limit: '50',
			sort: 'desc',
			md2html: 'true',
		};
		if (after) {
			params.before = after;
		};
		
		const { data } = await (await fetch(`https://arctic-shift.photon-reddit.com/api/${isPostPage ? 'posts' : 'comments'}/search?${new URLSearchParams(params)}`)).json();
		
		showToast({
			kind: 2,
			text: `Fetched ${data.length} ${isPostPage ? 'posts' : 'comments'} for u/${username} from arctic-shift`
		});

		const lastItem = data[data.length - 1];
		
		return {
			jsonResponse: JSON.stringify(
				await postAndCommentsListing(
					data.map((item: any) => {
						item = {
							kind: isPostPage ? 't3' : 't1',
							data: item,
						};
						return item;
					}),
					lastItem ? new Date(lastItem.created_utc * 1000).toISOString() : null
				)
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