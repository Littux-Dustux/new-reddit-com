import { getState } from "../../../main";
import { getRTJSONFirstText, getVoteStateNum } from "./common";
import { getAuthorFlairFromR2Thing } from "./flair";
import type { CommentListingPageState, ExtraComments } from "./listing";
import { markdownToRichText } from "./richtext";

export type CommentPosition = { id: string; type: string } | null;

export const processSingleComment = (comment: any, postId?: any) => ({
	approvedAtUTC: comment.approved_at_utc,
	approvedBy: comment.approved_by,
	author: comment.author,
	authorId: comment.author_fullname,
	authorIsBlocked: comment.author_is_blocked,
	bannedAtUTC: comment.banned_at_utc,
	bannedBy: comment.banned_by,
	bodyMD: comment.body,
	body: comment.body_html,
	collapsed: comment.collapsed,
	collapsedReason: comment.collapsed_reason,
	collapsedBecauseCrowdControl: comment.collapsed_because_crowd_control,
	collapsedReasonCode: comment.collapsed_reason_code,
	commentType: comment.comment_type,
	created: comment.created_utc,
	depth: comment.depth,
	deletedBy: comment.banned_by,
	distinguishType: comment.distinguished,
	editedAt: comment.edited,
	gildings: null,
	goldCount: 0,
	id: comment.name,
	ignoreReports: comment.ignore_reports,
	isAdmin: comment.distinguished === "admin",
	isAuthorCakeday: comment.author_cakeday,
	isAuthorPremium: Boolean(comment.author_premium),
	isApproved: comment.approved,
	isDeleted: comment.collapsed_reason_code === "DELETED" || (
		comment.author === "[deleted]" &&
		(comment.rtjson ? getRTJSONFirstText(comment.rtjson) : comment.body) === "[deleted]"
	),
	isGildable: true,
	isLocked: comment.locked,
	isMod: comment.distinguished === "yes",
	isOp: comment.is_submitter,
	isRemoved: comment.removed,
	isSaved: comment.saved,
	isStickied: comment.stickied,
	isScoreHidden: comment.score_hidden,
	media: {
		richtextContent: comment.rtjson ?? markdownToRichText(comment.body, comment.media_metadata),
		type: "rtjson",
		rteMode: comment.rte_mode,
		mediaMetadata: comment.media_metadata,
	},
	modReports: comment.mod_reports,
	next: null,
	numReports: comment.num_reports,
	parentId: comment.parent_id,
	permalink: comment.permalink,
	prev: null,
	profileImage: comment.profile_img,
	postAuthor: comment.link_author ?? null,
	postId: postId ?? comment.link_id,
	postTitle: comment.link_title ?? null,
	score: comment.score,
	sendReplies: comment.send_replies,
	subredditId: comment.subreddit_id,
	treatmentTags: comment.treatment_tags,
	userReports: comment.user_reports,
	unrepliableReason: comment.unrepliable_reason,
	voteState: getVoteStateNum(comment.likes),
});


const processMoreComment = (morecomments: any, postId: string) => ({
	depth: morecomments.depth,
	id: "moreComments-" + morecomments.name,
	next: null,
	numComments: morecomments.count,
	parentId: morecomments.parent_id,
	postId,
	prev: null,
	token: morecomments.children.join(","),
});


const processContinueThread = (morecomments: any, postId: string) => ({
	count: morecomments.count,
	depth: morecomments.depth,
	id: "continueThread-" + morecomments.parent_id,
	next: null,
	parentId: morecomments.parent_id,
	postId,
	prev: null,
});



export function addCommentToState(comment: any, state: CommentListingPageState) {
	state.comments[comment.name] = processSingleComment(comment);

	const appState = getState();
	const subId = comment.subreddit_id;
	state.authorFlair[subId] ??= {};
	state.authorFlair[subId][comment.author] ??= getAuthorFlairFromR2Thing(comment);

	if (!appState.postFlair[subId])
		state.postFlair[subId] ??= {
			displaySettings: {
				isEnabled: true,
				position: "right"
			}
		};

	if (!appState.posts.models[comment.link_id])
		state.posts[comment.link_id] ??= {
			author: comment.link_author ?? '[deleted]',
			belongsTo: {
				id: comment.subreddit_id,
				type: comment.subreddit_type === "user" ? "profile" : "subreddit",
			},
			events: [],
			flair: comment.over_18
				? [{ type: "nsfw", text: "nsfw" }]
				: [],
			id: comment.link_id,
			isNSFW: comment.over_18,
			isScoreHidden: true,
			numComments: comment.num_comments,
			postId: comment.link_id,
			permalink: comment.link_permalink ?? `/r/${comment.subreddit}/comments/${comment.link_id?.slice(3)}/_/`,
			score: 0,
			source: {
				displayText: comment.link_url
					? (comment.link_url.startsWith('/') ? 'www.reddit.com' : new URL(comment.link_url).hostname)
					: 'self.'+comment.subreddit,
				url: comment.link_url ?? `https://www.reddit.com/r/${comment.subreddit}/comments/${comment.link_id?.slice(3)}/_/`,
			},
			thumbnail: {
				width: 0,
				height: 0,
				url: "default",
			},
			title: comment.link_title ?? '[deleted]',
		};
	if (!appState.subreddits.models[subId])
		state.subreddits[subId] ??= {
			displayText: comment.subreddit_name_prefixed,
			icon: {
				width: 0,
				height: 0,
				url: null
			},
			id: comment.subreddit_id,
			name: comment.subreddit,
			isQuarantined: comment.quarantine,
			type: comment.subreddit_type,
			url: `/r/${comment.subreddit}/`
		};
}



type CommentTreeState = {
	authorFlair: Record<string, Record<string, any>>;
	commentLists: Record<string, {
		head: CommentPosition,
		tail: CommentPosition,
	}>;
	comments: Record<string, any>;
	continueThreads: Record<string, any>;
	moreComments: Record<string, any>;
};

export function addCommentTreeToState(
	commentChildren: Record<string, any>[],
	postId: string,
	state: CommentTreeState = {
		authorFlair: {},
		comments: {},
		commentLists: {},
		continueThreads: {},
		moreComments: {},
	},
	extraComments?: ExtraComments,
	_order: [string, any][] = [],
): CommentTreeState {

	const isTopLevelCall = _order.length === 0;
	const subId = commentChildren[0]?.data.subreddit_id;
	state.authorFlair[subId] ??= {};

	for (const { kind, data: comment } of commentChildren) {
		if (!comment.depth) {
			const parentComment = state.comments[comment.parent_id];
			comment.depth = (parentComment?.depth ?? -1) + 1;
		}

		if (kind === "t1") {
			const processedComment = processSingleComment(comment, postId);
			_order.push(['comment', processedComment]);
			state.comments[comment.name] = processedComment;
			state.authorFlair[subId][comment.author] ??= getAuthorFlairFromR2Thing(comment);

		} else if (comment.count === 0) {
			const processedContinueThread = processContinueThread(comment, postId);
			_order.push(['continueThread', processedContinueThread]);
			state.continueThreads[`continueThread-${comment.parent_id}`] = processedContinueThread;

		} else {
			const processedMoreComment = processMoreComment(comment, postId);
			_order.push(['moreComments', processedMoreComment]);
			state.moreComments[`moreComments-${comment.name}`] = processedMoreComment;
		}

		if (comment.replies?.data?.children) {
			addCommentTreeToState(comment.replies.data.children, postId, state, undefined, _order);
		}
	}

	// if it is the top level call, add orders to the comments, moreComments, and continueThreads objects
	if (isTopLevelCall) {
		for (let i = 0; i < _order.length; i++) {
			const currentItem = (_order[i] as [string, any])[1];
			const [prevType, prevItem] = _order[i - 1] ?? [];
			const [nextType, nextItem] = _order[i + 1] ?? [];

			currentItem.prev = prevType && {
				type: prevType,
				id: prevItem.id,
			};
			currentItem.next = nextType && {
				type: nextType,
				id: nextItem.id,
			};
		}

		const [firstType, firstItem] = _order[0] ?? [];
		let [lastType, lastItem] = _order[_order.length - 1] ?? [];

		if (extraComments) {
			lastItem.next = {
				type: 'extraComments',
				id: extraComments.id,
			};
			extraComments.prev = { type: lastType as string, id: lastItem.id };

			lastType = 'extraComments';
			lastItem = extraComments;

			//extraComments.depth = itemBeforeExtraComments.depth + 1;
		};

		state.commentLists[postId] = {
			head: firstType ? { type: firstType, id: firstItem.id } : null,
			tail: lastType ? { type: lastType, id: lastItem.id } : null,
		};
	}

	return state;
};