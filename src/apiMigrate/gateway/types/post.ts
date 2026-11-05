import type { RemovedByCategory } from "../../../api/types/gql";
import type { RichTextContent } from "./richtext";
import type { CommentSort, MediaAssetR2, PostAndCommentCommon } from "./common";
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
	gifBackgroundResolutions?: any[],
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

export interface MediaGallery extends MediaBase {
	type: "gallery",
	gallery: {
		items: {
			caption?: string;
			id?: number;
			mediaId?: string;
			callToAction?: any;
			displayAddress?: any;
			adEvents?: { type: number, url: string }[];
		}[];
	};
}

export type Media = MediaText | MediaRichtext | MediaImage | MediaGifVideo | MediaVideo | MediaEmbed | MediaGallery;


export interface PollData {
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
	voteUpdatesRemained: number | null,
	votingEndTimestamp: number,
	totalStakeAmount?: number,
	tournamentId?: string,
	userWonAmount?: number,
	resolvedOptionId: number,
}


export interface Post extends PostAndCommentCommon {
	adPromotedUserPostIds?: string[],
	adSupplementaryText?: string | null,
	belongsTo: {
		id: string,
		type: "subreddit" | "profile",
	},
	callToAction?: string | null | undefined,
	contestMode: boolean,
	crosspostParentId: string | undefined,
	crosspostRootId: string | undefined,
	discussionType?: string,
	domain: string,
	domainOverride: string | null,
	eventInfo?: { eventIsLive: boolean, eventStart: number, eventEnd: number },
	events: { type: number, url: string }[],
	flair: PostFlair[],
	hidden: boolean,
	impressionId?: string | null,
	impressionIdStr?: string | null,
	isArchived: boolean,
	isBlank?: boolean,
	isCreatedFromAdsUi?: boolean,
	isCrosspostable: boolean,
	isFollowed?: boolean,
	isMediaOnly?: boolean,
	isMeta?: boolean,
	isNSFW: boolean,
	isPinned: boolean,
	isOriginalContent?: boolean,
	isSpoiler: boolean,
	isSponsored?: boolean,
	isSurveyAd?: boolean,
	liveCommentsWebsocket?: string,
	media: Media | null,
	numComments: number,
	numCrossposts: number,
	numDuplicates: number,
	pollData: PollData | null,
	postCategories?: {
		categoryId: string,
		categoryName: string
	}[],
	preview: {
		url: string,
		width: number,
		height: number,
	} | null,
	removedBy?: string | null,
	removedByCategory: RemovedByCategory,
	saved: boolean,
	source: {
		displayText: string,
		url: string,
		outboundUrl?: string,
		outboundUrlCreated?: number,
		outboundUrlExpires?: number,
	} | null,
	suggestedSort?: CommentSort,
	thumbnail: {
		height: number,
		url: string,
		width: number,
	},
	title: string,
	upvoteRatio: number,
	viewCount: number,
}