import { getGIPHYGifsByIds as getRedditGIPHYGifsByIds } from "../../../api/giphy";
import { gqlFetch } from "../../../api/gql";
import { getLogger } from "../../../logging";
import { getMuxedMP4sDownloadRTJSON, getVideoMediaMetadataGql, getVoteStateNum } from "./common";
import { processPost } from "./posts";
import { getAuthorFlairFromR2Thing, processSubreddit, processSubredditAboutInfo, processSubredditPostFlair, processSubredditUserFlair } from "./subreddit";

type CommentPosition = { id: string; type: string } | null;

const logger = getLogger("mapComments");

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
	profileImage: comment.profile_img,
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

const recursiveProcessComments = async (
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
	// some giphy comments don't have the proper metadata, and have {"status":"invalid"}. So we'll fetch it from GIPHY.
	const brokenGiphyCommentMediaMetadatas: Record<string, any[]> = {};
	const giphyIdsToFetch: Set<string> = new Set();

	// reddit doesn't include videos in comments on the old API
	const videoCommentIncompleteMedias: Record<string, any> = {};
	const videoCommentIdsToFetch: string[] = [];

	for (let i = 0; i < commentChildren.length; i++) {
		const comment = commentChildren[i] as any;

		authorFlair[comment.data.author] ??= getAuthorFlairFromR2Thing(comment.data);

		const position = {
			next: getCommentPositionObject(commentChildren[i + 1]),
			prev: getCommentPositionObject(commentChildren[i - 1])
		}

		if (comment.kind === "more") {
			if (comment.data.count === 0) {
				continueThreads["continueThread-" + comment.data.parent_id] = processContinueThread(comment.data, postData, position);
			} else {
				moreComments["moreComments-" + comment.data.name] = processMoreComment(comment.data, postData, position);
			}
		} else {
			const processedComment = processSingleComment(comment.data, postData, position);
			comments[comment.data.name] = processedComment;

			const [firstMediaKey, firstMedia]: [string, any] = (processedComment.media.mediaMetadata && Object.entries(processedComment.media.mediaMetadata)[0]) ?? [null, null];

			if (firstMedia && firstMedia.status === "invalid" && firstMediaKey.startsWith("giphy|") ) {
				const giphyId = firstMediaKey.split("|")[1] as string;
				giphyIdsToFetch.add(giphyId);
				(brokenGiphyCommentMediaMetadatas[giphyId] ??= []).push(processedComment.media.mediaMetadata);
			} else if (processedComment.media.richtextContent.document.some((node: any) => node.e === "video")) {
				videoCommentIdsToFetch.push(processedComment.id);
				videoCommentIncompleteMedias[processedComment.id] = processedComment.media;
			}
		}

		/* threaded=false doesn't require recursive processing of comments.
		if (comment.data.replies?.kind === "Listing") {
			recursiveProcessComments(comment.data.replies.data.children, post, authorFlair, comments, moreComments);
		} */
	}

	const commentFixerPromises: Promise<void>[] = [];

	if (giphyIdsToFetch.size > 0)
		commentFixerPromises.push(
			getRedditGIPHYGifsByIds(giphyIdsToFetch).then(redditGiphyGifDatas => {
				for (const giphyId of giphyIdsToFetch) {
					const gifData = redditGiphyGifDatas[giphyId];
					const brokenMediaMetadatas = brokenGiphyCommentMediaMetadatas[giphyId];

					if (gifData && brokenMediaMetadatas) {
						for (const mediaMetadata of brokenMediaMetadatas) {
							mediaMetadata[gifData.id] = gifData;
						}
					}
				}
			}).catch(e => {
				logger.err("Error fetching GIPHY GIF data: " + (e as any).message);
			})
		);

	if (videoCommentIdsToFetch.length > 0)
		commentFixerPromises.push(
			gqlFetch("CommentMediaDetails", "4228949b61fb4a9c17aed04edc4be641a7c48a12fbd506151afde1ce0e335857", { ids: videoCommentIdsToFetch })
			.then(({ commentsByIds }) => {
				for (const comment of commentsByIds) {
					const incompleteMedia = videoCommentIncompleteMedias[comment.id];
					const videoAsset = comment.content?.richtextMedia?.[0];

					if (incompleteMedia && videoAsset?.status === "VALID") {
						incompleteMedia.mediaMetadata = {
							[videoAsset.id]: getVideoMediaMetadataGql(videoAsset)
						};
						const muxedMp4s = videoAsset.packagedMedia?.muxedMp4s;
						if (muxedMp4s) {
							incompleteMedia.richtextContent.document.push(...getMuxedMP4sDownloadRTJSON(muxedMp4s))
						}
					}
				}
			})
		);

	await Promise.all(commentFixerPromises);
	return { authorFlair, comments, continueThreads, moreComments };
};

export async function postcomments(post: Record<string, any>, commentsChildren: Record<string, any>[], structuredStyles: any = null) {
	const state: Record<string, any> = {
		account: null,
		authorFlair: {},
		commentLists: {
			[post.name]: {
				head: null,
				tail: null,
			},
		},
		comments: {},
		features: null,
		moreComments: {},
		postFlair: {},
		postMeta: null,
		posts: {},
		profiles: {},
		subreddits: {},
		preferences: null,
		continueThreads: {},
		subredditAboutInfo: {},
		structuredStyles,
		userFlair: {},
		subredditPermissions: null,
	};

	const posts = state.posts;
	posts[post.name] = processPost(post);

	if (post.crosspost_parent_list?.[0]) {
		const crossPost = post.crosspost_parent_list[0];
		const subId = crossPost.subreddit_id || "";
		posts[crossPost.name] = processPost(crossPost);

		state.authorFlair[subId] ??= {};
		state.authorFlair[subId][crossPost.author] = getAuthorFlairFromR2Thing(crossPost);

		if (crossPost.sr_detail) {
			state.subredditAboutInfo[subId] ??= processSubredditAboutInfo(crossPost.sr_detail);
			state.subreddits[subId] ??= processSubreddit(crossPost.sr_detail);
			state.postFlair[subId] ??= processSubredditPostFlair(crossPost.sr_detail);
			state.userFlair[subId] ??= processSubredditUserFlair(crossPost.sr_detail);
		}
	}

	const subId = post.subreddit_id || "";
	state.authorFlair[subId] ??= {};
	state.authorFlair[subId][post.author] = getAuthorFlairFromR2Thing(post);

	if (post.sr_detail) {
		state.subredditAboutInfo[subId] ??= processSubredditAboutInfo(post.sr_detail);
		state.subreddits[subId] ??= processSubreddit(post.sr_detail);
		state.postFlair[subId] ??= processSubredditPostFlair(post.sr_detail);
		state.userFlair[subId] ??= processSubredditUserFlair(post.sr_detail);
	}

	if (commentsChildren.length === 0) {
		return state;
	}

	const firstComment = commentsChildren[0];
	const lastComment = /* commentsChildren.length <= 1 ? null : */ commentsChildren[commentsChildren.length - 1];

	state.commentLists[post.name] = {
		head: getCommentPositionObject(firstComment),
		tail: getCommentPositionObject(lastComment),
	};

	await recursiveProcessComments(commentsChildren, post, {
		authorFlair: state.authorFlair,
		comments: state.comments,
		continueThreads: state.continueThreads,
		moreComments: state.moreComments,
	});

	return state;
}

export async function morecomments(things: Record<string, any>[], postId: string) {
	return {
		commentLists: {
			[postId]: {
				head: getCommentPositionObject(things[0]),
				tail: getCommentPositionObject(things[things.length - 1]),
			},
		},
		// full post object isn't needed, only post ID is needed
		...(await recursiveProcessComments(things, { name: postId }, {})),
	};
}