export interface CommentTreeResponse {
	postInfoById: CommentTreePostFragment;
}

export interface CommentTreePostFragment {
	__typename: "SubredditPost";
	id: string;
	title: string;
	subreddit: Subreddit;
	commentForest: CommentForest;
	commentCount: number;
}

export interface CommentForest {
	__typename: "CommentForest";
	trees: Tree[];
}

export interface Tree {
	depth: number;
	more: More | null;
	parentId: null;
	node: Node | null;
	childCount: number;
}

export interface More {
	count: number;
	cursor: string;
	isTooDeepForCount: boolean;
}

export interface Node {
	__typename: "Comment";
	id: string;
	createdAt: string;
	editedAt: null;
	isAdminTakedown: boolean;
	isRemoved: boolean;
	isLocked: boolean;
	isInitiallyCollapsed: boolean;
	initiallyCollapsedReason: any;
	content: Content;
	authorInfo?: AuthorInfo;
	score: number;
	voteState: string;
	authorFlair?: {
		text: string;
		richtext: string;
		textColor: string;
		template: {
			id: string,
			backgroundColor: string,
			isModOnly: boolean,
			isEditable: boolean,
		}
	};
	isSaved: boolean;
	isStickied: boolean;
	isScoreHidden: boolean;
	awardings: unknown[];
	associatedAward: null;
	treatmentTags: unknown[];
	isArchived: boolean;
	distinguishedAs?: string;
	permalink: string;
	moderationInfo: null;
	isTranslated: boolean;
	isCommercialCommunication: boolean;
}

export interface AuthorInfo {
	__typename: string;
	id: string;
	name: string;
	isCakeDayNow: boolean;
	oldIcon: IconSmall;
	iconSmall: IconSmall;
	snoovatarIcon: IconSmall;
	profile: Profile;
	accountType: string;
}

export interface IconSmall {
	__typename: string;
	url: string;
	dimensions: Dimensions;
}

export interface Dimensions {
	width: number;
	height: number;
}

export interface Profile {
	isNsfw: boolean;
}

export interface Content {
	__typename: string;
	markdown: string;
	html: null;
	richtext: string;
	typeHint: string;
	preview: string;
	richtextMedia: unknown[];
}

export interface Subreddit {
	id: string;
	name: string;
	prefixedName: string;
	moderation: Moderation;
	allowedMediaInComments: string[];
	isQuarantined: boolean;
	tippingStatus: null;
}

export interface Moderation {
	isShowCommentRemovalReasonPrompt: boolean;
}

export interface Extensions {
	traceID: string;
}
