import { gqlFetch } from "../../../api/gql";

export const structuredStylesLoadedSubs = new Set<string>();
export const subredditNameToId: Record<string, string> = {};

export const processModPermissionsGql = ({ id, name, modPermissions }: any) => {
	// Many mod endpoints from the app needs subreddit IDs, but d2x only provides name. And there is no "nameToId" in the Redux store. So we're storing it here
	subredditNameToId[name] = id;
	if (!modPermissions) {
		return null;
	}

	return {
		access: modPermissions.isAccessEnabled,
		all: modPermissions.isAllAllowed,
		chatConfig: modPermissions.isChatConfigEditingAllowed,
		chatOperator: modPermissions.isChatOperator,
		communityChat: false,
		channels: false,
		config: modPermissions.isConfigEditingAllowed,
		flair: modPermissions.isFlairEditingAllowed,
		mail: modPermissions.isMailEditingAllowed,
		posts: modPermissions.isPostEditingAllowed,
		wiki: modPermissions.isWikiEditingAllowed,
	};
};

export const processSubredditAboutInfo = (data: any) => ({
	acceptFollowers: data.accept_followers,
	accountsActive: 0,
	advertiserCategory: "NoThanks",
	allOriginalContent: false,
	allowedPostTypes: { links: true, images: true, videos: true, text: true, spoilers: true, polls: true, galleries: true, talks: false },
	allowedMediaInComments: data.allowed_media_in_comments.map((str: string) => str.toUpperCase()),
	contentCategory: "",
	created: data.created_utc,
	disableContributorRequests: data.disable_contributor_requests,
	emojisEnabled: false,
	hasExternalAccount: false,
	isCrosspostableSubreddit: false,
	isMediaInCommentsSettingShown: data.should_show_media_in_comments_setting ?? true,
	originalContentTagEnabled: false,
	publicDescription: data.public_description,
	restrictCommenting: data.restrict_commenting,
	restrictPosting: data.restrict_posting,
	shouldArchivePosts: false,
	showMedia: data.show_media,
	submitLinkLabel: data.submit_link_label,
	submitTextLabel: data.submit_text_label,
	subscribers: data.subscribers,
	userIsBanned: data.user_is_banned,
	userIsContributor: data.user_is_contributor,
	userIsSubscriber: data.user_is_subscriber,
	usingNewModmail: true,
});

export const processSubredditAboutInfoGql = (data: any) => {
	const allowedPostTypes = new Set<
		"LINK" | "IMAGE" | "VIDEO" | "TEXT" | "SPOILER" | "POLL" | "GALLERY" | "TALK" | "PREDICTION" | "VIDEOGIF" | "STREAMING" | "CROSSPOST"
	>(data.allowedPostTypes);
	return {
		acceptFollowers: !data.isQuarantined,
		accountsActive: 0,
		advertiserCategory: "NoThanks",
		allOriginalContent: false,
		contentCategory: "",
		created: Date.parse(data.createdAt) / 1000,
		disableContributorRequests: data.disable_contributor_requests,
		emojisEnabled: false,
		hasExternalAccount: false,
		isCrosspostableSubreddit: data.isCrosspostingAllowed,
		originalContentTagEnabled: false,
		publicDescription: data.publicDescriptionText,
		restrictCommenting: false,
		restrictPosting: data.isPostingRestricted,
		shouldArchivePosts: false,
		showMedia: true,
		submitLinkLabel: "",
		submitTextLabel: "",
		subscribers: data.subscribersCount,
		userIsBanned: data.isUserBanned,
		userIsContributor: data.isContributor,
		userIsSubscriber: data.isSubscribed,
		usingNewModmail: true,
		allowedPostTypes: {
			links: allowedPostTypes.has("LINK"),
			images: allowedPostTypes.has("IMAGE"),
			videos: allowedPostTypes.has("VIDEO"),
			text: allowedPostTypes.has("TEXT"),
			spoilers: allowedPostTypes.has("SPOILER"),
			polls: allowedPostTypes.has("POLL"),
			galleries: allowedPostTypes.has("GALLERY"),
			talks: allowedPostTypes.has("TALK"),
		},
	};
};

export const processSubreddit = (data: any) => ({
	displayText: data.display_name_prefixed,
	id: data.name,
	isQuarantined: data.quarantine,
	isNSFW: data.over_18,
	name: data.display_name,
	whitelistStatus: "no_ads",
	wls: 6,
	subscribers: 53968898,
	url: data.url,
	type: data.subreddit_type,
	icon: { url: data.icon_img, width: data.icon_size?.[0], height: data.icon_size?.[1] },
	acceptFollowers: data.accept_followers,
	title: data.title,
	communityIcon: data.community_icon,
	primaryColor: data.primary_color,
	allowChatPostCreation: false,
	isChatPostFeatureEnabled: false,
	freeFormReports: data.free_form_reports,
	allowPredictions: false,
	allowPredictionsTournament: false,
});

export const processSubredditGql = (data: any) => ({
	displayText: data.prefixedName,
	id: data.id,
	isQuarantined: data.isQuarantined,
	isNSFW: data.isNSFW,
	name: data.name,
	whitelistStatus: data.whitelistStatus.toLowerCase(),
	wls: 6,
	subscribers: data.subscribersCount,
	url: "/" + data.prefixedName + "/",
	type: data.type.toLowerCase(),
	icon: data.styles?.legacyIcon ? { url: data.styles.legacyIcon.url, width: 256, height: 256 } : {},
	acceptFollowers: !data.isQuarantined,
	title: data.title,
	communityIcon: data.styles?.icon,
	primaryColor: data.styles?.primaryColor,
	allowChatPostCreation: false,
	isChatPostFeatureEnabled: false,
	freeFormReports: true,
	allowPredictions: false,
	allowPredictionsTournament: false,
});


export const convertUnavailableSubredditToGatewayError = async (data: any) => {
	if (!data) {
		return {
			jsonResponse: JSON.stringify({
				reason: "NOT_FOUND",
				data: {
					account: null
				}
			}),
			status: 404
		}
	}

	if (data.forbiddenReason === "UNKNOWN") {
		const [{ userLocation }, { countryCodesNames }] = await Promise.all([
			gqlFetch(
				"UserLocation",
				"38d13413eb1ad10aebf568bb447e89aabe268df4e479dfe2d676d439709d56dc",
				{ isLegalRequest: true },
				{ cache: true, maxCacheAge: -1 }
			),
			gqlFetch("CountryCodeNames", "452d56b9ec308a5c30fac4f548d702bd522e18dc97aa6e2486701687e9e0b456", {}, { cache: true, maxCacheAge: -1 })
		]);

		const countryName = (countryCodesNames as { isoCode: string, name: string }[]).find(
			({ isoCode }) => isoCode === userLocation?.countryCode
		)?.name ?? userLocation?.countryCode ?? "your country";

		return {
			jsonResponse: JSON.stringify({
				reason: "BANNED",
				data: {
					account: null,
					banMessage: "Description: " + data.publicDescriptionText,
					banTitle: "This subreddit has been geoblocked in " + countryName,
					quarantineRequiresEmailOptin: data.isEmailRequiredForQuarantineOptin,
				}
			}),
			status: 404
		}
	}

	return {
		jsonResponse: JSON.stringify({
			reason: data.forbiddenReason,
			data: {
				account: null,
				banMessage: data.banMessage || void 0,
				banTitle: data.banTitle || void 0,
				description: data.publicDescriptionText,
				quarantineRequiresEmailOptin: data.isEmailRequiredForQuarantineOptin,
				...(data.quarantineMessage
					? {
						quarantineMessage: data.quarantineMessage.markdown,
						quarantineMessageRTJson: JSON.parse(data.quarantineMessage.richtext)
					} : {}),
				...(data.interstitialWarningMessage
					? {
						interstitialWarningMessage: data.interstitialWarningMessage.markdown,
						interstitialWarningMessageRTJson: JSON.parse(data.interstitialWarningMessage.richtext)
					} : {}),
			}
		}),
		status: data.forbiddenReason === "BANNED" ? 404 : 403
	}
};