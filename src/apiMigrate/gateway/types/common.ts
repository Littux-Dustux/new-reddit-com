import type { LastAuthorModNoteFragmentFragment, ModQueueTriggersFragmentFragment } from "../../../api/types/gql";
import type { Award } from "./award";

/** [reason, name] */
export type ModReport = [string, string];
/** [reason, count, isSnoozed, isSnoozable] */
export type UserReport = [string, number, boolean, boolean];

export type CommentSort = "confidence" | "top" | "new" | "controversial" | "old" | "qa" | "live";

export interface VideoAssetR2 {
	e: "RedditVideo",
	status: "valid",
	dashUrl: string,
	hlsUrl: string,
	id: string,
	x: number,
	y: number,
}

export interface AnimatedImageAssetR2 {
	e: "AnimatedImage",
	status: "valid",
	m: string,
	s: {
		x: number,
		y: number,
		gif: string,
		mp4: string,
	},
	p: {
		x: number,
		y: number,
		u: string
	}[],
	ext?: string,
	t?: "giphy",
	id: string,
}

interface GifImageAssetR2 {
	e: "gif",
	status: "valid",
	id: string,
	s: {
		gif: string,
		x: number,
		y: number
	},
	p: {
		x: number,
		y: number,
		u: string
	}[],
}

interface ImageAssetR2 {
	e: "Image",
	status: "valid",
	id: string,
	s: {
		u: string,
		x: number,
		y: number
	}
}

export type MediaAssetR2 =
	{ status: 'invalid' | 'failed' | 'unprocessed', id: string } |
	AnimatedImageAssetR2 |
	GifImageAssetR2 |
	ImageAssetR2 |
	VideoAssetR2;


export interface PostAndCommentCommon {
	allAwardings?: Award[],
	approvedAtUTC: number | null,
	approvedBy: string | null,
	author: string,
	authorId: string,
	authorIsBlocked: boolean,
	awardCountsById?: Record<string, number> | null,
	bannedAtUTC: number | null,
	bannedBy: string | null,
	created: number, // Reddit API returns seconds, UI usually needs ms
	distinguishType: string | null,
	editedAt: number | null,
	id: string,
	ignoreReports: boolean,
	isApproved: boolean,
	isAuthorCakeday: boolean,
	isAuthorPremium: boolean,
	isGildable: boolean,
	isLocked: boolean,
	isScoreHidden: boolean,
	isStickied: boolean,
	lastAuthorModNote?: LastAuthorModNoteFragmentFragment['lastAuthorModNote'],
	modQueueTriggers?: ModQueueTriggersFragmentFragment['modQueueTriggers'],
	modReports: ModReport[] | null, 
	modReportsDismissed?: ModReport[] | null,
	numReports: number,
	permalink: string,
	postId: string,
	previousActions?: any,
	score: number,
	sendReplies: boolean,
	userReports: UserReport[] | null,
	userReportsDismissed?: UserReport[] | null,
	voteState: -1 | 0 | 1,
}