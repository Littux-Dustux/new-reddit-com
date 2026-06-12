import { getVoteStateNum } from "./common";

// Originally, I had my own post mapper. But I found a "r2 normalize" function from a new reddit js bundle.
// I asked an AI to rewrite my function with information from reddit's own function

const getFlair = (data: any) => {
	const flair = [];
	if (data.link_flair_richtext?.length) {
		flair.push({
			richtext: data.link_flair_richtext,
			type: "richtext",
			textColor: data.link_flair_text_color || "dark",
			backgroundColor: data.link_flair_background_color || "",
			templateId: data.link_flair_template_id,
		});
	}
	if (data.link_flair_text) {
		flair.push({
			text: data.link_flair_text,
			type: "text",
			textColor: data.link_flair_text_color || "dark",
			backgroundColor: data.link_flair_background_color || "",
			templateId: data.link_flair_template_id,
		});
	}
	if (data.spoiler) flair.push({ text: "spoiler", type: "spoiler" });
	if (data.over_18) flair.push({ text: "nsfw", type: "nsfw" });
	return flair;
};

const getMedia = (data: any) => {
	const isPreviewEnabled = data.preview?.enabled;
	const isObscured = data.over_18 || data.spoiler;
	let obfuscatedUrl = null;

	if (data.preview) {
		const variants = data.preview.images[0]?.variants || {};
		if (isObscured && variants.obfuscated) {
			obfuscatedUrl = variants.obfuscated.source.url;
		}
	}

	// 1. Text/Self Post
	if (data.is_self) {
		return {
			content: data.selftext_html,
			type: "text",
			markdownContent: data.selftext,
			obfuscated: obfuscatedUrl,
			rteMode: data.rte_mode || "rich_text",
			...(data.rtjson && {
				richtextContent: data.rtjson,
				type: "rtjson",
				mediaMetadata: data.media_metadata,
			}),
		};
	}

	// 2. Embeds / Surveys
	if ((data.secure_media && data.secure_media.oembed) || data.is_survey_ad) {
		return {
			content: data.secure_media_embed?.media_domain_url,
			type: "embed",
			width: data.secure_media?.oembed?.width || 0,
			height: data.secure_media?.oembed?.height || 0,
			obfuscated: obfuscatedUrl,
			provider: data.secure_media?.oembed?.provider_name || "",
		};
	}

	// 3. Native Reddit Video
	if (data.media?.reddit_video) {
		const v = data.media.reddit_video;
		return {
			hlsUrl: v.hls_url,
			dashUrl: v.dash_url,
			isGif: v.is_gif,
			scrubberThumbSource: v.scrubber_media_url,
			obfuscated: obfuscatedUrl,
			posterUrl: v.url,
			width: v.width,
			height: v.height,
			type: "video",
		};
	}

	// 4. Preview Images/Gifs
	if (isPreviewEnabled) {
		const images = data.preview.images[0];
		const variants = images.variants || {};

		if (variants.mp4) {
			return {
				content: variants.mp4.source.url,
				type: "gifvideo",
				width: variants.mp4.source.width,
				height: variants.mp4.source.height,
				gifBackgroundImage: images.source.url,
				gifBackgroundResolutions: images.resolutions,
				obfuscated: obfuscatedUrl,
				resolutions: variants.mp4.resolutions,
			};
		}

		return {
			content: images.source.url,
			type: "image",
			width: images.source.width,
			height: images.source.height,
			obfuscated: obfuscatedUrl,
			resolutions: variants.gif ? variants.gif.resolutions : images.resolutions,
		};
	}

	return null;
};

const getSource = (data: any) => {
	if ((data.promoted && data.outbound_link) || (!data.is_self && !data.is_reddit_media_domain)) {
		const source: any = {
			displayText: data.domain,
			url: data.url,
		};
		if (data.outbound_link) {
			source.outboundUrl = data.outbound_link.url;
			source.outboundUrlExpiration = data.outbound_link.expiration;
			source.outboundUrlCreated = data.outbound_link.created;
		}
		return source;
	}
	return null;
};

export const processPost = (data: any) => ({
	adPromotedUserPostIds: [],
	adSupplementaryText: null,
	approvedAtUTC: data.approved_at_utc,
	approvedBy: data.approved_by,
	author: data.author,
	authorId: data.author_fullname,
	authorIsBlocked: data.author_is_blocked,
	bannedAtUTC: data.banned_at_utc,
	bannedBy: data.banned_by,
	belongsTo: {
		id: data.subreddit_id || "",
		type: data.subreddit_type === "user" ? "profile" : "subreddit",
	},
	callToAction: data.call_to_action || null,
	contestMode: data.contest_mode,
	created: data.created_utc * 1000, // Reddit API returns seconds, UI usually needs ms
	crosspostParentId: data.cross_post_parent_id || null,
	crosspostRootId: data.cross_post_root_id || null,
	discussionType: data.discussion_type || null,
	distinguishType: data.distinguish_type || null,
	domain: data.domain,
	domainOverride: data.domain_override || null,
	events: data.events || [],
	flair: getFlair(data),
	hidden: data.hidden,
	id: data.name,
	ignoreReports: data.ignore_reports,
	impressionId: data.impression_id ? String(data.impression_id) : null,
	impressionIdStr: data.impression_id_str || null,
	isApproved: data.approved,
	isArchived: data.archived,
	isAuthorPremium: data.author_premium,
	isBlank: !!data.is_blank,
	isCreatedFromAdsUi: data.is_created_from_ads_ui,
	isCrosspostable: data.is_crosspostable,
	isGildable: data.can_gild,
	isLocked: data.locked,
	isMediaOnly: data.media_only,
	isMeta: data.is_meta,
	isNSFW: data.over_18,
	isPinned: data.pinned,
	isOriginalContent: data.is_original_content,
	isScoreHidden: Boolean(data.hide_score),
	isSpoiler: data.spoiler,
	isSponsored: Boolean(data.promoted),
	isStickied: data.stickied,
	isSurveyAd: Boolean(data.is_survey_ad),
	liveCommentsWebsocket: data.liveCommentsWebsocket || data.websocket_url,
	media: getMedia(data),
	modReports: data.mod_reports,
	numComments: data.num_comments,
	numCrossposts: data.num_crossposts || 0,
	numDuplicates: data.num_duplicates,
	numReports: data.num_reports || 0,
	permalink: data.permalink,
	postCategories:
		data.post_categories?.map((c: any) => ({
			categoryId: c.category_id,
			categoryName: c.category_name,
		})) || [],
	postId: data.name,
	preview: data.preview?.images?.[0]?.source
		? {
				url: data.preview.images[0].source.url,
				width: data.preview.images[0].source.width,
				height: data.preview.images[0].source.height,
			}
		: undefined,
	removedBy: data.removed_by,
	removedByCategory: data.removed_by_category,
	saved: data.saved,
	score: data.score,
	sendReplies: data.send_replies,
	source: getSource(data),
	suggestedSort: data.suggested_sort,
	thumbnail: {
		height: data.thumbnail_height,
		url: data.thumbnail,
		width: data.thumbnail_width,
	},
	title: data.title,
	upvoteRatio: data.upvote_ratio,
	userReports: data.user_reports,
	viewCount: data.view_count || 0,
	voteState: getVoteStateNum(data.likes),
});
