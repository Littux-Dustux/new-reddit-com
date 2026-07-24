import { gqlFetch } from "../api/gql";
import { subscribe, unsubscribe } from "../api/gqlRealtime";
import type { CommentTreePostFragment, CommentTreeResponse, Tree } from "../api/types/gql/commentTree";
import { getLogger } from "../logging";
import { getState } from "../main";


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
			topLevelCommentCountChange: number;
		}
	}
}



const logger = getLogger('liveChat');

function* convertGqlNodesToNewCommentPayload(postInfoById: CommentTreePostFragment): Generator<NewCommentPayload> {
	const trees = postInfoById.commentForest.trees;

	for (let i = postInfoById.commentForest.trees.length - 1; i >= 0; i--) {
		const tree = (postInfoById.commentForest.trees[i] as Tree);
		const comment = tree.node;
		if (!comment) continue;

		yield {
			type: "new_comment",
			payload: {
				_id36: comment.id.slice(3),
				associated_award: null,
				attribs: [],
				...(comment.authorFlair ? {
					author_flair_background_color: comment.authorFlair.template.backgroundColor,
					author_flair_richtext: JSON.parse(comment.authorFlair.richtext),
					author_flair_template_id: comment.authorFlair.template.id,
					author_flair_text_color: comment.authorFlair.textColor.toLowerCase(),
					author_flair_text: comment.authorFlair.text,
					author_flair_type: comment.authorFlair.richtext ? 'richtext' : 'text',
				} : {
					author_flair_background_color: "",
					author_flair_richtext: "",
					author_flair_template_id: "",
					author_flair_text_color: "",
					author_flair_text: "",
					author_flair_type: "",
				}),
				author_fullname: comment.authorInfo?.id || "",
				author_icon_img: comment.authorInfo?.iconSmall.url || "",
				author_id: parseInt(comment.authorInfo?.id || "0", 10),
				author_is_default_icon: false,
				author_is_nsfw_icon: comment.authorInfo?.profile.isNsfw || false,
				author_snoovatar_img: comment.authorInfo?.snoovatarIcon?.url || "",
				author: comment.authorInfo?.name || "",
				body_html: "",
				body: comment.content.markdown,
				collapsed_in_crowd_control: comment.initiallyCollapsedReason,
				collapsed: comment.isInitiallyCollapsed,
				comment_type: null,
				context: comment.permalink,
				created_utc: Math.floor(new Date(comment.createdAt).getTime() / 1000),
				distinguished: comment.distinguishedAs?.toLowerCase() || "",
				flair_css_class: "",
				flair_position: "",
				full_date: comment.createdAt,
				link_id: postInfoById.id,
				name: comment.id,
				parent_id: (trees[i] as Tree).parentId || "",
				rtjson: JSON.parse(comment.content.richtext),
				score: comment.score,
				subreddit_id: postInfoById.subreddit.id,
				subreddit_name_prefixed: postInfoById.subreddit.prefixedName,
				subreddit: postInfoById.subreddit.name,
				total_comment_count: postInfoById.commentCount,
			},
		};
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
	subredditData: any;
	callbacks: { close?: (ev: Event) => void, message?: (ev: MessageEvent) => void } = {};
	pendingCommentsCount: number = 0;
	lastFetchTime: number = 0;
	isFetchPending: boolean = false;

	constructor(id: string) {
		this.postId = id;
		this.subredditData = (getState().subreddits.models as any)?.[
			(getState().posts.models as any)[id]?.belongsTo.id
		] ?? {};

		subscribe<CommentCountChangeMessage>({
			operationName: "CommentCounts",
			query: "subscription CommentCounts($id:ID!){subscribe(input:{channel:{teamOwner:CONTENT_AND_COMMUNITIES category:COMMENT_COUNT_UPDATE postID:$id}}){...on BasicMessage{data{...on CommentCountUpdateMessageData{topLevelCommentCountChange}}}}}",
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
		if (!this.callbacks.message) {
			logger.err("No message callback found, ignoring commenting count change.");
			return;
		};

		if (message.subscribe.data.topLevelCommentCountChange < 0) {
			logger.log("Ignoring negative comment count " + message.subscribe.data.topLevelCommentCountChange);
			return;
		};

		this.pendingCommentsCount += message.subscribe.data.topLevelCommentCountChange;
		if (this.pendingCommentsCount < 1) {
			logger.log(`New comment count is less than 1 (${this.pendingCommentsCount}), not loading any comments.`);
			return;
		};

		if (this.isFetchPending) {
			logger.log(`Fetch already pending, not loading comments yet. Pending count: ${this.pendingCommentsCount}`);
			return;
		} else {
			this.isFetchPending = true;
		};

		const delay = this.lastFetchTime === 0
			? 0
			: Math.min(Math.max(5000 - (Date.now() - this.lastFetchTime), 0), 2000);
		await new Promise(r => setTimeout(r, delay));

		const count = this.pendingCommentsCount;
		const data = await gqlFetch<CommentTreeResponse>(
			"PostCommentsNew",
			"f80b51384f447635e8539ddfafa4423bf6f562cf65a9077598552b283f9397b4",
			{
				id: this.postId,
				sortType: "LIVE",
				count: count + 1,
				includeAwards: false,
    		}
		).catch(() => {
			logger.err("Failed to fetch new comments for post " + this.postId);
		});

		this.isFetchPending = false;

		if (data?.postInfoById) {
			this.pendingCommentsCount -= count;
			this.lastFetchTime = Date.now();

			for (const newCommentPayload of convertGqlNodesToNewCommentPayload(data.postInfoById)) {
				this.callbacks.message({ data: JSON.stringify(newCommentPayload) } as any);
				await new Promise(r => setTimeout(r, 100));
			}
		}
	}
}