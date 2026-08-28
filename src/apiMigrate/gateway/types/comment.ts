import type { CommentCollapsedReason } from "../../../api/types/gql"
import type { CommentPosition } from "../mappers/comments"
import type { MediaAssetR2, PostAndCommentCommon } from "./common"
import type { RichTextContent } from "./richtext"


interface Media {
	type: "rtjson",
	richtextContent: RichTextContent,
	mediaMetadata?: Record<string, MediaAssetR2> | null,
	rteMode: string,
}

export interface Comment extends PostAndCommentCommon {
	bodyMD?: string,
	body?: string,
	collapsed: boolean,
	collapsedBecauseCrowdControl: boolean,
	collapsedReasonCode: CommentCollapsedReason,
	commentType: string,
	depth: number,
	deletedBy: 'user' | 'moderator' | null,
	goldCount: 0,
	isAdmin: boolean,
	isDeleted: boolean,
	isMod: boolean,
	isOp: boolean,
	isRemoved: boolean,
	isSaved: boolean,
	media: Media,
	next: CommentPosition | null,
	parentId: string,
	prev: CommentPosition | null,
	profileImage: string,
	postAuthor?: string,
	postId: string,
	postTitle?: string,
	subredditId: string,
	treatmentTags?: any,
	unrepliableReason: string | null,
}