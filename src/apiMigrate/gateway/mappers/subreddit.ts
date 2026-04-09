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
	allowedPostTypes: {
		links: true,
		images: true,
		videos: true,
		text: true,
		spoilers: true,
		polls: true,
		galleries: true,
		talks: false,
	},
});

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
	icon: {
		url: data.icon_img,
		width: data.icon_size?.[0],
		height: data.icon_size?.[1],
	},
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


export const processSubredditPostFlair = (data: any) => ({
	displaySettings: {
		isEnabled: data.link_flair_enabled,
		position: data.link_flair_position,
	},
	permissions: {
		canAssignOwn: true,
	},
	templates: {},
	templateIds: [],
});

export const processSubredditUserFlair = (data: any) => ({
	displaySettings: {
		isUserEnabled: false,
		isEnabled: true,
		position: "right",
	},
	permissions: {
		canUserChange: false,
		canAssignOwn: false,
	},
	applied: null,
	templates: {},
	templateIds: [],
});


export const processAuthorFlair = (data: any) => (data.author_flair_text ? {
	text: data.author_flair_text,
	richtext: data.author_flair_richtext,
	backgroundColor: data.author_flair_background_color,
	templateId: data.author_flair_template_id,
	textColor: data.author_flair_text_color,
	type: data.author_flair_type,
} : null);