import { markdown } from "snudown-js";
import { getState } from "../../../main";
import { getVoteStateNum } from "./common";
import { getAuthorFlairFromR2Thing, processSubredditPostFlair, processSubredditUserFlair } from "./flair";
import type { StateBase } from "./listing";
import { processSubredditAboutInfo, processSubreddit } from "./subreddit";

// Originally, I had my own post mapper. But I found a "r2 normalize" function from a new reddit js bundle.
// I asked an AI to rewrite my function with information from reddit's own function

const getFlair = (data: any) => {
	const flair = [];
	if (data.spoiler) flair.push({ text: "spoiler", type: "spoiler" });
	if (data.over_18) flair.push({ text: "nsfw", type: "nsfw" });
	if (data.link_flair_richtext?.length) {
		flair.push({
			richtext: data.link_flair_richtext,
			type: "richtext",
			textColor: data.link_flair_text_color || "dark",
			backgroundColor: data.link_flair_background_color || "",
			cssClass: data.link_flair_css_class || null,
			templateId: data.link_flair_template_id,
		});
	}
	if (data.link_flair_text) {
		flair.push({
			text: data.link_flair_text,
			type: "text",
			textColor: data.link_flair_text_color || "dark",
			backgroundColor: data.link_flair_background_color || "",
			cssClass: data.link_flair_css_class || null,
			templateId: data.link_flair_template_id,
		});
	}
	return flair;
};

const getMedia = (data: any, devvitData?: any) => {
	const isPreviewEnabled = data.preview?.enabled;
	const isObscured = data.over_18 || data.spoiler;
	let obfuscatedUrl = null;

	if (data.preview) {
		const variants = data.preview.images[0]?.variants || {};
		if (isObscured && variants.obfuscated) {
			obfuscatedUrl = variants.obfuscated.source.url;
		}
	}

	if (devvitData?.__typename === "DevvitPost") {
		return {
			content: `devvit:http://${location.host}/embed.html?${encodeURIComponent(convertDevvitDataToIFrame(devvitData).outerHTML)}`,
			type: "embed",
			width: 640,
			height: 512,
			obfuscated: obfuscatedUrl,
			provider: "reddit",
			richtextContent: data.rtjson
		};
	}

	if (data.is_gallery || data.gallery_data) {
		const galleryData = data.gallery_data || { items: [] };

		return {
			type: "gallery",
			obfuscated: obfuscatedUrl,
			gallery: {
				items: (galleryData.items || []).map((it: any) => ({
					caption: it.caption,
					id: it.id,
					mediaId: it.media_id,
					adEvents: it.ad_events ?? [],
				})),
			},
			mediaMetadata: data.media_metadata,
			crossPostRootId: data.cross_post_root_id || null,
			crossPostParentId: data.cross_post_parent_id || null,
			numCrossposts: data.num_crossposts || 0,
			isCrosspostable: data.is_crosspostable,
			richtextContent: data.rtjson,
		};
	}

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

	if ((data.secure_media && data.secure_media.oembed) || data.is_survey_ad) {
		return {
			content: data.secure_media_embed?.media_domain_url,
			type: "embed",
			width: data.secure_media?.oembed?.width || 640,
			height: data.secure_media?.oembed?.height || 480,
			obfuscated: obfuscatedUrl,
			provider: data.secure_media?.oembed?.provider_name || "",
			richtextContent: data.rtjson,
			markdownContent: data.selftext,
		};
	}

	if (data.media?.reddit_video) {
		const v = data.media.reddit_video;
		return {
			hlsUrl: v.hls_url,
			dashUrl: v.dash_url,
			isGif: v.is_gif,
			scrubberThumbSource: v.scrubber_media_url,
			obfuscated: obfuscatedUrl,
			posterUrl: data.preview?.images?.[0]?.source?.url || data.thumbnail,
			width: v.width,
			height: v.height,
			type: "video",
			richtextContent: data.rtjson,
			markdownContent: data.selftext,
		};
	}

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
				richtextContent: data.rtjson,
				markdownContent: data.selftext,
			};
		}

		return {
			content: images.source.url,
			type: "image",
			width: images.source.width,
			height: images.source.height,
			obfuscated: obfuscatedUrl,
			resolutions: variants.gif ? variants.gif.resolutions : images.resolutions,
			richtextContent: data.rtjson,
			markdownContent: data.selftext,
		};
	}

	return {
		type: data.rtjson ? 'rtjson' : 'text',
		richtextContent: data.rtjson,
		markdownContent: data.selftext,
		content: data.selftext_html,
	};
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

const normalizeR2Poll = (data: any) => ({
	isPrediction: data.is_prediction,
	predictionStatus: data.prediction_status?.toUpperCase(),
	options: data.options.map(
		(opt: any) => ({
			text: opt.text,
			voteCount: opt.vote_count,
			id: opt.id,
			userStakeAmount: data.user_stake_amount
		})
	),
	totalVoteCount: data.total_vote_count,
	userSelection: data.user_selection,
	voteUpdatesRemained: data.vote_updates_remained,
	votingEndTimestamp: data.voting_end_timestamp,
	totalStakeAmount: data.total_stake_amount,
	tournamentId: data.tournament_id,
	userWonAmount: data.user_won_amount,
	resolvedOptionId: data.resolved_option_id,
});

export const processPost = (data: any, devvitData?: any) => ({
	adPromotedUserPostIds: [],
	adSupplementaryText: null,
	approvedAtUTC: data.approved_at_utc,
	approvedBy: data.approved_by,
	author: data.author,
	authorId: data.author_fullname,
	authorIsBlocked: data.author_is_blocked,
	awardCountsById: (getState().posts.models as any)[data.name]?.awardCountsById,
	bannedAtUTC: data.banned_at_utc,
	bannedBy: data.banned_by,
	belongsTo: {
		id: data.subreddit_id || "",
		type: data.subreddit_type === "user" ? "profile" : "subreddit",
	},
	callToAction: data.call_to_action || null,
	contestMode: data.contest_mode,
	created: data.created_utc * 1000, // Reddit API returns seconds, UI usually needs ms
	crosspostParentId: data.cross_post_parent_id || data.crosspost_parent_list?.[0]?.name || null,
	crosspostRootId: data.cross_post_root_id || data.crosspost_parent_list?.[0]?.name || null,
	discussionType: /\b(thread|megathread)\b/.test(data.title)
		? "CHAT"
		: data.discussion_type
			? data.discussion_type.toUpperCase()
			: null,
	distinguishType: data.distinguished || null,
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
	isGildable: true, // data.can_gild,
	isLocked: data.locked,
	isMediaOnly: data.media_only,
	isMeta: data.is_meta,
	isNSFW: data.over_18,
	isPinned: data.pinned,
	isOriginalContent: data.is_original_content,
	isScoreHidden: false, // Boolean(data.hide_score),
	isSpoiler: data.spoiler,
	isSponsored: Boolean(data.promoted),
	isStickied: data.stickied,
	isSurveyAd: Boolean(data.is_survey_ad),
	liveCommentsWebsocket: data.name,  // data.liveCommentsWebsocket || data.websocket_url,
	media: getMedia(data, devvitData),
	modReports: data.mod_reports,
	numComments: data.num_comments,
	numCrossposts: data.num_crossposts || 0,
	numDuplicates: data.num_duplicates,
	numReports: data.num_reports || 0,
	permalink: data.permalink,
	pollData: data.poll_data ? normalizeR2Poll(data.poll_data) : null,
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
		: null,
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


export function addPostToState(post: any, state: StateBase, postWithDevvit?: any) {
	state.posts[post.name] = processPost(post, postWithDevvit?.devvit);

	const subId = post.subreddit_id;
	state.authorFlair[subId] ??= {};
	state.authorFlair[subId][post.author] = getAuthorFlairFromR2Thing(post);

	if (post.sr_detail) {
		state.subredditAboutInfo[subId] ??= processSubredditAboutInfo(post.sr_detail);
		state.subreddits[subId] ??= processSubreddit(post.sr_detail);
		state.postFlair[subId] ??= processSubredditPostFlair(post.sr_detail);
		state.userFlair[subId] ??= processSubredditUserFlair(post.sr_detail);

	} else {
		state.subreddits[subId] ??= {
			displayText: post.subreddit_name_prefixed,
			id: post.subreddit_id,
			name: post.subreddit,
			icon: {
				width: 256,
				height: 256,
				url: "",
			},
			isQuarantined: post.quarantine,
			subscribers: post.subreddit_subscribers,
			type: post.subreddit_type,
			url: `/r/${post.subreddit}/`
		};
		state.postFlair[subId] ??= {
			displaySettings: {
				isEnabled: true,
				position: "right"
			}
		};
		state.userFlair[subId] ??= {
			displaySettings: {
				isEnabled: true,
				isUserEnabled: false,
				position: "right"
			}
		};
	}

	const crossPost = post.crosspost_parent_list?.[0];
	if (crossPost) {
		addPostToState(crossPost, state, postWithDevvit?.crosspostRoot?.postInfo?.devvit);
	}
	return state;
}


export const convertDevvitDataToIFrame = (devvit: any): HTMLIFrameElement => {
	const iframe = document.createElement("iframe");
	iframe.allow = "clipboard-write; web-share";
	iframe.loading = "lazy";
	iframe.referrerPolicy = "origin";
	iframe.sandbox = "allow-forms allow-same-origin allow-scripts";
	iframe.name = JSON.stringify({
		appPermissionState: { consentStatus: 0, requestedScopes: [], grantedScopes: [] },
		client: 3,
		devvitDebug: "",
		postData: JSON.parse(devvit.postData),
		shredditVersion: { major: 0, minor: 13, patch: 6, version: "0.13.6" },
		signedRequestContext: devvit.signedRequestContext,
		startTime: Date.now(),
		viewMode: 1,
		webbitToken: devvit.webbitToken,
		webViewClientData: JSON.parse(devvit.webViewClientData),
	});
	iframe.src = devvit.entrypointUrl;
	return iframe;
}