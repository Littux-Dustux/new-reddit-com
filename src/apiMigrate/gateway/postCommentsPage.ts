import { getREST, postREST, RedditAPIError } from "../../api/rest";
import { postcomments, morecomments } from "./mappers/comments";
import { structuredStylesLoadedSubs } from "./mappers/subreddit";


export const postCommentsResponse = async (postID: string, commentID: string | undefined, params: Record<string, string>) => {
	try {
		const fetchStructuredStyles = params.subredditName && (
			!structuredStylesLoadedSubs.has(params.subredditName.toLowerCase())
			|| params.include?.includes("structuredStyles")
		);
		const structuredStyles = fetchStructuredStyles
			? getREST(`/api/v1/structured_styles/${params.subredditName}.json?raw_json=1`)
			: null;

		if (fetchStructuredStyles) {
			structuredStylesLoadedSubs.add(params.subredditName?.toLowerCase() ?? '');
		}

		const [
			{ data: { children: [{ data: postData }] }},
			{ data: { children: comments }}
		] = await getREST(`/comments/${postID.slice(3)}/_/${(commentID?.slice(3)) ?? ''}.json?${new URLSearchParams({
			...params,
			sr_detail: "1",
			always_include_media: "1",
			feature: "link_preview",
			profile_img: "1",
			threaded: "false",
			raw_json: "1",
			raw_media_syntax: "1",
			context: "10000"
		})}`);
		return {
			jsonResponse: JSON.stringify(await postcomments(postData, comments, await structuredStyles)),
			status: 200
		};
	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status
			}
		} else throw e;
	}
}

export const moreCommentsResponse = async (postID: string, childrenIDs: string) => {
	try {
		const data = await postREST(
			"/api/morechildren.json?raw_json=1&raw_media_syntax=1&profile_img=1&emotes_as_images=true&rtj=only&threaded=false&redditWebClient=web2x&app=web2x-client-production", 
			new URLSearchParams({
				link_id: postID,
				children: childrenIDs,
				api_type: "json",
			})
		);
		return {
			jsonResponse: JSON.stringify(await morecomments(data.json.data.things, postID)),
			status: 200
		};
	} catch(e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status
			}
		} else throw e;
	}
}