import type { AdEventType, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost_crosspostRoot_CrosspostRoot_post_Post_gallery_Gallery_items_PostGalleryItem_adEvents_AdEvent } from "../../../../api/types/gql";

const adEventToNum: Partial<Record<AdEventType, number>> = {
	IMPRESSION: 1,
	CLICK: 2,
	COMMENTS_VIEW: 3,
	UPVOTE: 4,
	DOWNVOTE: 5,
	COMMENT: 6,
	VIEWABLE_IMPRESSION: 7,
	COMMENT_UPVOTE: 8,
	COMMENT_DOWNVOTE: 9,
	VENDOR_FULLY_IN_VIEW: 10,
	VENDOR_FULLY_IN_VIEW_5_SECS: 11,
	VENDOR_FULLY_IN_VIEW_15_SECS: 12,
	GROUP_M_VIEWABLE: 13,
	UNLOAD: 14,
	GALLERY_ITEM_IMPRESSION: 15,
	VIDEO_VIEWABLE_IMPRESSION: 100,
	VIDEO_FULLY_VIEWABLE_IMPRESSION: 101,
	VIDEO_PLAYED_WITH_SOUND: 102,
	VIDEO_PLAYED_EXPANDED: 103,
	VIDEO_WATCHED_25: 104,
	VIDEO_WATCHED_50: 105,
	VIDEO_WATCHED_75: 106,
	VIDEO_WATCHED_95: 107,
	VIDEO_WATCHED_100: 108,
	VIDEO_STARTED: 109,
	VIDEO_WATCHED_3_SECS: 111,
	VIDEO_WATCHED_5_SECS: 112,
	VIDEO_WATCHED_10_SECS: 113,
	VIDEO_GROUP_M_VIEWABLE: 114,
	VIDEO_VENDOR_FULLY_VIEWABLE_50: 115,
	MRC_VIDEO_VIEWABLE_IMPRESSION: 115
}

export const mapAdEvents = (events: SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost_crosspostRoot_CrosspostRoot_post_Post_gallery_Gallery_items_PostGalleryItem_adEvents_AdEvent[]) => {
	const result = [];
	for (const ev of events) {
		if (typeof adEventToNum[ev.type] === "number") {
			result.push({
				type: adEventToNum[ev.type] as number,
				url: ev.url,
			})
		}
	}
	return result;
}