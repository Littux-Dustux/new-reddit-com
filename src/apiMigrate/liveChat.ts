import { subscribe, unsubscribe } from "../api/gqlRealtime";
import { getREST, RedditAPIError } from "../api/rest";
import { getLogger } from "../logging";
import { getState } from "../main";
import { processSingleComment } from "./gateway/mappers/comments";
import type { Post } from "./gateway/types/post";


interface NewCommentPayload {
	type: "new_comment";
	payload: {
		_id36: string;
		associated_award: null;
		attribs: [];
		author_flair_background_color: string;
		author_flair_richtext: any;
		author_flair_template_id: string;
		author_flair_text_color: string;
		author_flair_text: string;
		author_flair_type: string;
		author_fullname: string;
		author_icon_img: string;
		author_id: number;
		author_is_default_icon: false;
		author_is_nsfw_icon: boolean;
		author_snoovatar_img: string;
		author: string;
		body_html: string;
		body: string;
		collapsed_in_crowd_control: boolean;
		collapsed: boolean;
		comment_type: null;
		context: string;
		created_utc: number;
		distinguished: string;
		flair_css_class: string;
		flair_position: string;
		full_date: string;
		link_id: string;
		name: string;
		parent_id: string | undefined;
		rtjson: any;
		score: number;
		subreddit_id: string;
		subreddit_name_prefixed: string;
		subreddit: string;
		total_comment_count: number;
	};
}

interface CommentCountChangeMessage {
	subscribe: {
		data: {
			commentCountChange: number;
		}
	}
}


const logger = getLogger('liveChat');

async function* fetchNewCommentsForSubreddit(subreddit: string, before?: string | null) {
	while (true) {
		let data;

		try {
			data = (await getREST(
				`/r/${subreddit}/comments.json?raw_json=1&rtj=only&profile_img=1&limit=100&count=2000${
					before ? `&before=${before}` : ''
				}`
			)).data;
		} catch (e) {
			// before ID no longer in the 1000 comments range, reset and try again
			if (e instanceof RedditAPIError && e.status === 400) {
				before = null;
				continue;
			};
			throw e;
		}

		before = data.before;
		data.children.reverse();
		yield* data.children;

		if (!before) break;
	}
}



export function patchWebSocket() {
	const OriginalWebSocket = WebSocket;

	(window as any).WebSocket = class {
		constructor(urlOrPostId: string, protocols: any) {
			if (urlOrPostId.startsWith("t3_")) {
				return new LiveCommentsFakeSocket(urlOrPostId);
			} else {
				return new OriginalWebSocket(urlOrPostId, protocols);
			}
		}
	};

	Object.defineProperties((window as any).WebSocket, {
		CONNECTING: { value: OriginalWebSocket.CONNECTING },
		OPEN: { value: OriginalWebSocket.OPEN },
		CLOSING: { value: OriginalWebSocket.CLOSING },
		CLOSED: { value: OriginalWebSocket.CLOSED },
	});
}

class LiveCommentsFakeSocket {
	postId: string;
	commentsPageKey: string;
	subredditName: any;
	headCommentId: string;

	callbacks: { close?: (ev: Event) => void, message?: (ev: MessageEvent) => void } = {};
	lastFetchTime: number = 0;
	isFetchPending: boolean = false;
	commentsBefore: string;

	constructor(id: string) {
		this.postId = id;
		this.commentsPageKey = `commentsPage--[post:'${id}']`;
		this.headCommentId = (getState().pages.comments.keyToHeadCommentId as any)[this.commentsPageKey];
		this.commentsBefore = this.headCommentId;
		this.subredditName = getState().subreddits.models[
			(getState().posts.models[id] as Post).belongsTo.id
		].name;

		subscribe<CommentCountChangeMessage>({
			operationName: "CommentCounts",
			query: "subscription CommentCounts($id:ID!){subscribe(input:{channel:{teamOwner:CONTENT_AND_COMMUNITIES category:COMMENT_COUNT_UPDATE postID:$id}}){...on BasicMessage{data{...on CommentCountUpdateMessageData{commentCountChange}}}}}",
			variables: { id },
			id,
		}, this._handleMessage.bind(this));
	}

	addEventListener(type: keyof WebSocketEventMap, callback: (ev: Event) => void) {
		switch (type) {
			case "open":
				callback({} as any);
				break;
			case "close":
			case "message":
				this.callbacks[type] = callback;
		}
	}
	close() {
		unsubscribe(this.postId);
		this.callbacks.close?.({} as any);
	}

	async _handleMessage(message: CommentCountChangeMessage) {
		if (message.subscribe.data.commentCountChange <= 0) {
			logger.log(`Ignoring comment count change of ${message.subscribe.data.commentCountChange}`);
			return;
		};

		if (this.isFetchPending) {
			logger.log("Fetch already pending, not loading comments yet.");
			return;
		} else {
			this.isFetchPending = true;
		};

		const delay = this.lastFetchTime === 0
			? 0
			: Math.min(Math.max(10_000 - (Date.now() - this.lastFetchTime), 0), 2000);
		await new Promise(r => setTimeout(r, delay));

		const actionPayloads = [];

		try {
			for await (const { data } of fetchNewCommentsForSubreddit(this.subredditName, this.commentsBefore)) {
				this.commentsBefore = data.name;

				if (data.link_id === this.postId && !getState().features.comments.models[data.name]) {
					actionPayloads.push({
						"comment": processSingleComment(data, this.postId),
						"commentsPageKey": this.commentsPageKey,
						"headCommentId": this.headCommentId,
						"numComments": data.num_comments ?? 0,
					});
					this.headCommentId = data.name;
				}
			}
		} finally {
			this.lastFetchTime = Date.now();
			this.isFetchPending = false;
		};

		for (const payload of actionPayloads) {
			window.store.dispatch({ "type": "COMMENT__LIVECOMMENTS__NEWCOMMENT", payload });
			await new Promise(r => setTimeout(r, 200));
		}
	}
}