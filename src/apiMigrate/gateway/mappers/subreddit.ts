export const processSubredditAboutInfo = (data: any) => ({
	acceptFollowers: data.accept_followers,
	accountsActive: 0,
	advertiserCategory: "NoThanks",
	allOriginalContent: false,
	contentCategory: "",
	created: data.created_utc,
	disableContributorRequests: data.disable_contributor_requests,
	emojisEnabled: false,
	hasExternalAccount: false,
	isCrosspostableSubreddit: false,
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
	allowedPostTypes: { links: true, images: true, videos: true, text: true, spoilers: true, polls: true, galleries: true, talks: false },
});

export const processSubredditAboutInfoGql = (data: any) => {
	const allowedPostTypes = new Set<"LINK" | "IMAGE" | "VIDEO" | "TEXT" | "SPOILER" | "POLL" | "GALLERY" | "TALK" | "PREDICTION" | "VIDEOGIF" | "STREAMING" | "CROSSPOST">(data.allowedPostTypes);
	return {
		acceptFollowers: !data.isQuarantined,
		accountsActive: 0,
		advertiserCategory: "NoThanks",
		allOriginalContent: false,
		contentCategory: "",
		created: Number(new Date(data.createdAt)),
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
			talks: allowedPostTypes.has("TALK")
		},
	}
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
	url: "/"+data.prefixedName,
	type: data.type.toLowerCase(),
	icon: data.styles?.legacyIcon ? {
		url: data.styles.legacyIcon.url,
		width: 256,
		height: 256
	} : {},
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


export const processSubredditPostFlair = (data: any) => ({
	displaySettings: { isEnabled: data.link_flair_enabled, position: data.link_flair_position },
	permissions: { canAssignOwn: true },
	templates: {},
	templateIds: [],
});

export const processSubredditPostFlairGql = (data: any) => ({
	displaySettings: {
		isEnabled: data.postFlairSettings.isEnabled,
		position: "right"
	}
})


export const processSubredditUserFlair = (data: any) => ({
	displaySettings: { isUserEnabled: false, isEnabled: true, position: "right" },
	permissions: { canUserChange: false, canAssignOwn: false },
	applied: null,
	templates: {},
	templateIds: [],
});

export const processSubredditUserFlairGql = ({ authorFlairSettings, modPermissions, authorFlair }: any) => ({
	displaySettings: {
		isEnabled: authorFlairSettings.isEnabled,
		isUserEnabled: authorFlairSettings.isOwnFlairEnabled,
		position: "right"
	},
	permissions: {
		canUserChange: authorFlairSettings.isSelfAssignable,
		canAssignOwn: authorFlairSettings.isSelfAssignable || (
			modPermissions && (
				modPermissions.isAllAllowed || modPermissions.isFlairEditingAllowed
			)
		),
	},
	applied: authorFlair?.template ? {
		text: authorFlair.template.text,
		richtext: authorFlair.template.richtext ? JSON.parse(authorFlair.template.richtext) : [],
		backgroundColor: authorFlair.template.backgroundColor,
		templateId: authorFlair.template.id,
		textColor: authorFlair.template.textColor,
		type: authorFlair.template.rtjson ? "rtjson" : "text",
	} : null,
	templates: {},
	templateIds: [],
});


export const getAuthorFlairFromR2Thing = (data: any) =>
	data.author_flair_text
		? {
				text: data.author_flair_text,
				richtext: data.author_flair_richtext,
				backgroundColor: data.author_flair_background_color,
				templateId: data.author_flair_template_id,
				textColor: data.author_flair_text_color,
				type: data.author_flair_type,
			}
		: null;
