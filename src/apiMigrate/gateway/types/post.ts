import type { LastAuthorModNoteFragmentFragment, ModQueueTriggersFragmentFragment, RemovedByCategory } from "../../../api/types/gql";
import type { RichTextContent } from "../mappers/richtext_types";
import type { Award } from "./award";
import type { CommentSort, MediaAssetR2, ModReport, UserReport } from "./common";
import type { PostFlair } from "./flair"


interface MediaBase {
	content: string | null,
	markdownContent: string | null,
	richtextContent: RichTextContent | null,
	obfuscated: string | null,
	rteMode: string | null,
	isRichtextPreview?: boolean,
	mediaMetadata: Record<string, MediaAssetR2> | null,
}

export interface MediaText extends MediaBase {
	type: "text",
}

export interface MediaRichtext extends MediaBase {
	type: "rtjson",
}

interface MediaImage extends MediaBase {
	type: "image",
	width: number,
	height: number,
	resolutions: any[],
}

interface MediaGifVideo extends MediaBase {
	type: "gifvideo",
	width: number,
	height: number,
	gifBackgroundImage: string,
	gifBackgroundResolutions: any[],
	resolutions: any[],
}

interface MediaVideo extends MediaBase {
	type: "video",
	width: number,
	height: number,
	hlsUrl: string | null,
	dashUrl: string | null,
	isGif: boolean,
	scrubberThumbSource: string | null,
	posterUrl: string | null,
	packagedMedia?: {
		playbackMp4s: {
			duration: number,
			permutations: {
				source: {
					url: string,
					videoCodec: "H264" | "VP9"
				}
			}[]
		}
	}
}

interface MediaEmbed extends MediaBase {
	type: "embed",
	width: number,
	height: number,
	provider: string | null,
}

interface MediaGallery extends MediaBase {
	type: "gallery",
	gallery: {
		items: {
			caption?: string;
			id?: string;
			mediaId?: string;
			adEvents?: any[];
		}[];
	};
}

export type Media = MediaText | MediaRichtext | MediaImage | MediaGifVideo | MediaVideo | MediaEmbed | MediaGallery;


interface PollData {
	isPrediction?: boolean,
	predictionStatus?: string,
	options: {
		text: string,
		voteCount: number,
		id: string,
		userStakeAmount?: number
	}[],
	totalVoteCount: number,
	userSelection: number,
	voteUpdatesRemained: number,
	votingEndTimestamp: number,
	totalStakeAmount?: number,
	tournamentId?: string,
	userWonAmount?: number,
	resolvedOptionId: number,
}


export interface Post {
	allAwardings?: Award[],
	adPromotedUserPostIds: [],
	adSupplementaryText: string | null,
	approvedAtUTC: number | null,
	approvedBy: string | null,
	author: string,
	authorId: string,
	authorIsBlocked: boolean,
	awardCountsById?: Record<string, number> | null,
	bannedAtUTC: number | null,
	bannedBy: string | null,
	belongsTo: {
		id: string,
		type: "subreddit" | "profile",
	},
	callToAction: string | null,
	contestMode: boolean,
	created: number, // Reddit API returns seconds, UI usually needs ms
	crosspostParentId: string | null,
	crosspostRootId: string | null,
	discussionType: string,
	distinguishType: string | null,
	domain: string,
	domainOverride: string | null,
	editedAt: number | null,
	events: [],
	flair: PostFlair[],
	hidden: boolean,
	id: string,
	ignoreReports: boolean,
	impressionId: string | null,
	impressionIdStr: string | null,
	isApproved: boolean,
	isArchived: boolean,
	isAuthorCakeday: boolean,
	isAuthorPremium: boolean,
	isBlank: boolean,
	isCreatedFromAdsUi: boolean,
	isCrosspostable: boolean,
	isGildable: boolean,
	isLocked: boolean,
	isMediaOnly: boolean,
	isMeta: boolean,
	isNSFW: boolean,
	isPinned: boolean,
	isOriginalContent: boolean,
	isScoreHidden: boolean,
	isSpoiler: boolean,
	isSponsored: boolean,
	isStickied: boolean,
	isSurveyAd: boolean,
	lastAuthorModNote?: LastAuthorModNoteFragmentFragment['lastAuthorModNote'],
	liveCommentsWebsocket: string,
	media: Media | null,
	modQueueTriggers?: ModQueueTriggersFragmentFragment['modQueueTriggers'],
	modReports: ModReport[] | null, 
	modReportsDismissed?: ModReport[] | null,
	numComments: number,
	numCrossposts: number,
	numDuplicates: number,
	numReports: number,
	permalink: string,
	pollData: PollData | null,
	postCategories: {
		categoryId: string,
		categoryName: string
	}[],
	postId: string,
	preview: {
		url: string,
		width: number,
		height: number,
	} | null,
	previousActions?: any,
	removedBy: string | null,
	removedByCategory: RemovedByCategory,
	saved: boolean,
	score: number,
	sendReplies: boolean,
	source: {
		displayText: string,
		url: string,
		outboundUrl?: string,
		outboundUrlCreated?: number,
		outboundUrlExpires?: number,
	} | null,
	suggestedSort: CommentSort,
	thumbnail: {
		height: number,
		url: string,
		width: number,
	},
	title: string,
	upvoteRatio: number,
	userReports: UserReport[] | null,
	userReportsDismissed?: UserReport[] | null,
	viewCount: number,
	voteState: -1 | 0 | 1,
}