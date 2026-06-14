import { getVoteStateNum } from "./common";
import { processPost } from "./posts";
import { getAuthorFlairFromR2Thing, processSubreddit, processSubredditAboutInfo, processSubredditPostFlair, processSubredditUserFlair } from "./subreddit";

type CommentPosition = { id: string; type: string } | null;

const processSingleComment = (comment: any, post: any = {}, { next, prev }: { next: CommentPosition; prev: CommentPosition } = { next: null, prev: null }) => ({
	approvedAtUTC: comment.approved_at_utc,
	approvedBy: comment.approved_by,
	author: comment.author,
	authorId: comment.author_fullname,
	bannedAtUTC: comment.banned_at_utc,
	bannedBy: comment.banned_by,
	bodyMD: comment.body,
	body: comment.body_html ?? "",
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
	isAuthorPremium: Boolean(comment.author_premium),
	isApproved: comment.approved,
	isDeleted: comment.collapsed_reason_code === "DELETED" || (comment.author === "[deleted]" && comment.body === "[deleted]"),
	isGildable: true,
	isLocked: comment.locked,
	isMod: comment.distinguished === "yes",
	isOp: comment.is_submitter,
	isRemoved: comment.removed,
	isSaved: comment.saved,
	isStickied: comment.stickied,
	isScoreHidden: comment.score_hidden,
	media: {
		richtextContent: comment.rtjson,
		type: "rtjson",
		rteMode: comment.rte_mode,
		mediaMetadata: comment.media_metadata,
	},
	modReports: comment.mod_reports,
	next,
	numReports: comment.num_reports,
	parentId: comment.parent_id,
	permalink: comment.permalink,
	prev,
	postAuthor: post.author ?? comment.link_author ?? null,
	postId: post.name ?? comment.link_id,
	postTitle: post.title ?? comment.link_title ?? null,
	score: comment.score,
	sendReplies: comment.send_replies,
	subredditId: comment.subreddit_id,
	treatmentTags: comment.treatment_tags,
	userReports: comment.user_reports,
	voteState: getVoteStateNum(comment.likes),
});

const processMoreComment = (morecomments: any, post: any, { next, prev }: { next: CommentPosition; prev: CommentPosition }) => ({
	depth: morecomments.depth,
	id: "moreComments-" + morecomments.name,
	next,
	numComments: morecomments.count,
	parentId: morecomments.parent_id,
	postId: post.name,
	prev,
	token: morecomments.children.join(","),
});

const processContinueThread = (morecomments: any, post: any, { next, prev }: { next: CommentPosition; prev: CommentPosition }) => ({
	count: morecomments.count,
	depth: morecomments.depth,
	id: "continueThread-" + morecomments.parent_id,
	next,
	parentId: morecomments.parent_id,
	postId: post.name,
	prev,
});

const getCommentPositionObject = (comment: any): CommentPosition => {
	if (!comment) return null;
	return {
		id:
			comment.kind === "more"
				? comment.data.count === 0
					? "continueThread-" + comment.data.parent_id
					: "moreComments-" + comment.data.name
				: comment.data.name,
		type: comment.kind === "more" ? (comment.data.count === 0 ? "continueThread" : "moreComments") : "comment",
	};
};

const recursiveProcessComments = (
	commentChildren: Record<string, any>[],
	postData: Record<string, any>,
	{
		authorFlair = {},
		comments = {},
		continueThreads = {},
		moreComments = {},
	}: {
		authorFlair?: Record<string, any>;
		comments?: Record<string, any>;
		continueThreads?: Record<string, any>;
		moreComments?: Record<string, any>
	},
) => {
	for (let i = 0; i < commentChildren.length; i++) {
		const comment = commentChildren[i] as any;

		authorFlair[comment.data.author] ??= getAuthorFlairFromR2Thing(comment.data);

		const position = {
			next: getCommentPositionObject(commentChildren[i + 1]),
			prev: getCommentPositionObject(commentChildren[i - 1])
		}

		if (comment.kind === "more") {
			if (comment.data.count === 0)
				continueThreads["continueThread-" + comment.data.parent_id] = processContinueThread(comment.data, postData, position);
			else
				moreComments["moreComments-" + comment.data.name] = processMoreComment(comment.data, postData, position);
		} else {
			comments[comment.data.name] = processSingleComment(comment.data, postData, position);
		}

		/* threaded=false doesn't require recursive processing of comments.
		if (comment.data.replies?.kind === "Listing") {
			recursiveProcessComments(comment.data.replies.data.children, post, authorFlair, comments, moreComments);
		} */
	}

	return { authorFlair, comments, continueThreads, moreComments };
};

export function postcomments(postData: Record<string, any>, commentsChildren: Record<string, any>[]) {
	const data: Record<string, any> = {
		account: null,
		authorFlair: {
			[postData.author]: getAuthorFlairFromR2Thing(postData),
		},
		commentLists: {
			[postData.name]: {
				head: null,
				tail: null,
			},
		},
		comments: {},
		features: null,
		moreComments: {},
		postFlair: {
			[postData.subreddit_id]: processSubredditPostFlair(postData.sr_detail),
		},
		postMeta: null,
		posts: {
			[postData.name]: processPost(postData),
		},
		profiles: {},
		subreddits: {
			[postData.subreddit_id]: processSubreddit(postData.sr_detail),
		},
		preferences: null,
		continueThreads: {},
		subredditAboutInfo: {
			[postData.subreddit_id]: processSubredditAboutInfo(postData.sr_detail),
		},
		structuredStyles: null,
		userFlair: {
			[postData.subreddit_id]: processSubredditUserFlair(postData.sr_detail),
		},
		subredditPermissions: null,
	};

	if (commentsChildren.length === 0) {
		return data;
	}

	const firstComment = commentsChildren[0];
	const lastComment = /* commentsChildren.length <= 1 ? null : */ commentsChildren[commentsChildren.length - 1];

	data.commentLists[postData.name] = {
		head: getCommentPositionObject(firstComment),
		tail: getCommentPositionObject(lastComment),
	};

	recursiveProcessComments(commentsChildren, postData, {
		authorFlair: data.authorFlair,
		comments: data.comments,
		continueThreads: data.continueThreads,
		moreComments: data.moreComments,
	});

	return data;
}

export function morecomments(things: Record<string, any>[], postId: string) {
	return {
		commentLists: {
			[postId]: {
				head: getCommentPositionObject(things[0]),
				tail: getCommentPositionObject(things[things.length - 1]),
			},
		},
		// full post object isn't needed, only post ID is needed
		...recursiveProcessComments(things, { name: postId }, {}),
	};
}