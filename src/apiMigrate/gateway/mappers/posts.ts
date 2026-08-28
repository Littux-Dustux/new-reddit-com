import { getState } from "../../../main";
import type { PostFlair } from "../types/flair";
import type { Media, MediaRichtext, MediaText, Post } from "../types/post";
import { antiGifFuckGifs, getVoteStateNum } from "./common";
import { getAuthorFlairFromR2Thing, processSubredditPostFlair, processSubredditUserFlair } from "./flair";
import type { StateBase } from "./listing";
import { processSubredditAboutInfo, processSubreddit } from "./subreddit";


const getFlair = (data: any): PostFlair[] => {
	const flair: PostFlair[] = [];
	if (data.link_flair_richtext?.length) {
		flair.push({
			type: "richtext",
			richtext: data.link_flair_richtext,
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
	if (data.spoiler) flair.push({ text: "spoiler", type: "spoiler" });
	if (data.over_18) flair.push({ text: "nsfw", type: "nsfw" });
	if (data.quarantine) flair.push({ text: "quarantined", type: "quarantined" });
	return flair;
};

const getMedia = (data: any, devvitData?: any): Media | null => {
	const isPreviewEnabled = data.preview?.enabled;
	const isObscured = data.over_18 || data.spoiler;
	let obfuscatedUrl = null;
	
	if (data.preview) {
		const variants = data.preview.images[0]?.variants || {};
		if (isObscured && variants.obfuscated) {
			obfuscatedUrl = variants.obfuscated.source.url;
		}
	};

	const baseMedia = {
		type: data.rtjson ? "rtjson" : "text",
		content: data.selftext_html,
		markdownContent: data.selftext,
		obfuscated: obfuscatedUrl,
		rteMode: data.rte_mode,
		isRichtextPreview: data.is_richtext_preview,
		richtextContent: data.rtjson,
		mediaMetadata: data.media_metadata,
	} as MediaText | MediaRichtext;
	
	if (data.is_self) {
		return baseMedia;
	}

	if (devvitData?.__typename === "DevvitPost") {
		return {
			...baseMedia,
			content: `devvit:http://${location.host}/embed.html?${encodeURIComponent(convertDevvitDataToIFrame(devvitData).outerHTML)}`,
			type: "embed",
			width: 640,
			height: 512,
			obfuscated: obfuscatedUrl,
			provider: "reddit",
		};
	}

	if (data.is_gallery || data.gallery_data) {
		const galleryData = data.gallery_data || { items: [] };

		return {
			...baseMedia,
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
			mediaMetadata: antiGifFuckGifs(data.media_metadata),
			richtextContent: data.rtjson,
		};
	}


	if (data.secure_media?.oembed || data.is_survey_ad) {
		return {
			...baseMedia,
			content: data.secure_media_embed?.media_domain_url,
			type: "embed",
			width: data.secure_media?.oembed?.width || 640,
			height: data.secure_media?.oembed?.height || 480,
			obfuscated: obfuscatedUrl,
			provider: data.secure_media?.oembed?.provider_name || "",
		};
	}

	if (data.media?.reddit_video) {
		const v = data.media.reddit_video;
		return {
			...baseMedia,
			hlsUrl: v.hls_url,
			dashUrl: v.dash_url,
			isGif: v.is_gif,
			scrubberThumbSource: v.scrubber_media_url,
			obfuscated: obfuscatedUrl,
			posterUrl: data.preview?.images?.[0]?.source?.url || data.thumbnail,
			width: v.width,
			height: v.height,
			type: "video",
		};
	}

	if (isPreviewEnabled) {
		const images = data.preview.images[0];
		const variants = images.variants || {};

		if (variants.mp4) {
			return {
				...baseMedia,
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
			...baseMedia,
			content: images.source.url,
			type: "image",
			width: images.source.width,
			height: images.source.height,
			obfuscated: obfuscatedUrl,
			resolutions: variants.gif ? variants.gif.resolutions : images.resolutions,
		};
	}

	return data.selftext || data.selftext_html || data.rtjson?.document.length ? baseMedia : null;
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

export const processPost = (data: any, devvitData?: any): Post => {
	const postFromState: Post | undefined = getState().posts.models[data.name];
	const crossPostId = data.cross_post_parent_id || data.crosspost_parent_list?.[0]?.name;

	return ({
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
		crosspostParentId: crossPostId,
		crosspostRootId: crossPostId,
		discussionType: (/discussion thread|(match|race) discussion/i).test(data.title)
			? "CHAT"
			: data.discussion_type
				? data.discussion_type.toUpperCase()
				: null,
		distinguishType: data.distinguished || null,
		domain: data.domain,
		domainOverride: data.domain_override || null,
		editedAt: data.edited,
		events: data.events || [],
		flair: getFlair(data),
		hidden: data.hidden,
		id: data.name,
		ignoreReports: data.ignore_reports,
		impressionId: data.impression_id ? String(data.impression_id) : null,
		impressionIdStr: data.impression_id_str || null,
		isApproved: data.approved,
		isArchived: data.archived,
		isAuthorCakeday: data.author_cakeday,
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
		/* mediaStatus: {
			transcodingStatus: data.media?.reddit_video?.transcoding_status?.toUpperCase()
		}, */
		modReports: data.mod_reports,
		modReportsDismissed: data.mod_reports_dismissed,
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
		title: postFromState?.title ?? data.title,
		upvoteRatio: data.upvote_ratio,
		userReports: data.user_reports,
		userReportsDismissed: data.user_reports_dismissed,
		viewCount: data.view_count || 0,
		voteState: getVoteStateNum(data.likes),
	});
}


export function addPostToState(post: any, state: StateBase, postWithDevvit?: any) {
	state.posts[post.name] = processPost(post, postWithDevvit?.devvit);

	const appState = getState();
	const subId = post.subreddit_id;
	state.authorFlair[subId] ??= {};
	state.authorFlair[subId][post.author] = getAuthorFlairFromR2Thing(post);

	if (post.sr_detail) {
		state.subredditAboutInfo[subId] ??= processSubredditAboutInfo(post.sr_detail);
		state.subreddits[subId] ??= processSubreddit(post.sr_detail);
		if (!appState.postFlair[subId])
			state.postFlair[subId] ??= processSubredditPostFlair(post.sr_detail);
		if (!appState.features.userFlair[subId])
			state.userFlair[subId] ??= processSubredditUserFlair(post.sr_detail);

	} else {
		if (!appState.subreddits.models[subId])
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
		if (!appState.postFlair[subId])
			state.postFlair[subId] ??= {
				displaySettings: {
					isEnabled: true,
					position: "right"
				}
			};
		if (!appState.features.userFlair[subId])
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