import { getREST } from "../../api/rest";
import { postcomments, morecomments } from "./mappers/commentsPage";


export const postCommentsResponse = async (postID: string, commentID: string | undefined, params: Record<string, string>) => {
	const [
		{ data: { children: [{ data: postData }] }},
		{ data: { children: comments }}
	] = await getREST(`/comments/${postID.slice(3)}/_/${(commentID?.slice(3)) ?? ''}.json?${new URLSearchParams({
		...params,
		sr_detail: "1",
		threaded: "false",
		raw_json: "1",
		raw_media_syntax: "1"
	})}`);
	return JSON.stringify(postcomments(postData, comments));
}

export const moreCommentsResponse = async (postID: string, children: string) => {
	// don't know how it's called yet
}