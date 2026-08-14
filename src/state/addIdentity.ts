import { isLoggedIn, state } from ".";
import { gqlFetch } from "../api/gql";
import { getREST } from "../api/rest";
import type { State } from "../main";
import { getLoidState } from "./utils";

export interface PrefsV1 {
	accept_pms: string;
	activity_relevant_ads: boolean;
	allow_clicktracking: boolean;
	bad_comment_autocollapse: string;
	beta: boolean;
	clickgadget: boolean;
	collapse_left_bar: boolean;
	collapse_read_messages: boolean;
	compress: boolean;
	country_code: string;
	default_comment_sort: string;
	default_theme_sr: null;
	design_beta: boolean;
	domain_details: boolean;
	email_chat_request: boolean;
	email_comment_reply: boolean;
	email_community_discovery: boolean;
	email_digests: boolean;
	email_messages: boolean;
	email_new_user_welcome: boolean;
	email_post_reply: boolean;
	email_private_message: boolean;
	email_unsubscribe_all: boolean;
	email_upvote_comment: boolean;
	email_upvote_post: boolean;
	email_user_new_follower: boolean;
	email_username_mention: boolean;
	enable_default_themes: boolean;
	enable_followers: boolean;
	feed_recommendations_enabled: boolean;
	geopopular: string;
	hide_ads: boolean;
	hide_downs: boolean;
	hide_from_robots: boolean;
	hide_ups: boolean;
	highlight_controversial: boolean;
	highlight_new_comments: boolean;
	ignore_suggested_sort: boolean;
	label_nsfw: boolean;
	lang: string;
	layout: string;
	legacy_search: boolean;
	live_bar_recommendations_enabled: boolean;
	live_orangereds: boolean;
	mark_messages_read: boolean;
	media_preview: string;
	media: string;
	monitor_mentions: boolean;
	newwindow: boolean;
	nightmode: boolean;
	no_profanity: boolean;
	num_comments: number;
	numsites: number;
	over_18: boolean;
	private_feeds: boolean;
	profile_opt_out: boolean;
	public_server_seconds: boolean;
	public_votes: boolean;
	research: boolean;
	search_include_over_18: boolean;
	send_crosspost_messages: boolean;
	send_welcome_messages: boolean;
	show_flair: boolean;
	show_gold_expiration: boolean;
	show_link_flair: boolean;
	show_location_based_recommendations: boolean;
	show_presence: boolean;
	show_snoovatar: boolean;
	show_stylesheets: boolean;
	show_trending: boolean;
	show_twitter: boolean;
	sms_notifications_enabled: boolean;
	store_visits: boolean;
	survey_last_seen_time: null;
	third_party_data_personalized_ads: boolean;
	third_party_personalized_ads: boolean;
	third_party_site_data_personalized_ads: boolean;
	third_party_site_data_personalized_content: boolean;
	threaded_messages: boolean;
	threaded_modmail: boolean;
	top_karma_subreddits: boolean;
	use_global_defaults: boolean;
	video_autoplay: boolean;
	whatsapp_comment_reply: boolean;
	whatsapp_enabled: boolean;
}

type PrefsState = State['user']['prefs'];

const convertPrefsV1ToState = (prefs: PrefsV1): PrefsState => ({
	acceptPrivateMessages: prefs.accept_pms,
	activityRelevantAds: prefs.activity_relevant_ads,
	allowClickTracking: prefs.allow_clicktracking,
	autoplayVideo: prefs.video_autoplay,
	badCommentAutocollapse: prefs.bad_comment_autocollapse,
	collapsedTraySections: {
		favorites: true,
		moderating: true,
		multis: true,
		profiles: true,
		subscriptions: true,
	},
	collapseReadMessages: prefs.collapse_read_messages,
	commentMode: "markdown",
	countryCode: prefs.country_code,
	defaultCommentSort: prefs.default_comment_sort,
	editorMode: "markdown",
	emailDigests: prefs.email_digests,
	emailUnreadMessages: prefs.email_messages,
	emailUnsubscribe: prefs.email_unsubscribe_all,
	enableFollowers: prefs.enable_followers,
	gatedSubredditOptIn: false,
	geopopular: prefs.geopopular,
	globalTheme: "REDDIT",
	hasSeenCustomizeFlyout: true,
	hideAds: prefs.hide_ads,
	hideFromRobots: prefs.hide_from_robots,
	hideNSFW: !prefs.search_include_over_18,
	highlightComments: prefs.highlight_new_comments,
	ignoreSuggestedSort: prefs.ignore_suggested_sort,
	isAdPersonalizationAllowed: false,
	isFirstPartyAdPersonalizationPreferenceShown: false,
	isThirdPartyAdPersonalizationAllowed: prefs.third_party_personalized_ads,
	isThirdPartyInfoAdPersonalizationAllowed: prefs.third_party_data_personalized_ads,
	isThirdPartySiteAdPersonalizationAllowed: prefs.third_party_site_data_personalized_ads,
	labelNSFW: prefs.label_nsfw,
	layout: prefs.layout,
	liveBarRecommendationsEnabled: prefs.live_bar_recommendations_enabled,
	loginOtpEnabled: false,
	markMessagesRead: prefs.mark_messages_read,
	nightmode: prefs.nightmode,
	openPostInNewTab: false, //prefs.newwindow,
	over18: prefs.over_18,
	quarantineOptIn: false,
	reduceAnimationsFromAwards: false,
	rememberCommunityLayout: true,
	rememberCommunitySort: true,
	searchOver18: prefs.search_include_over_18,
	sendWelcomeMessages: prefs.send_welcome_messages,
	sensitiveAdsPreferences: {
		isAlcoholAllowed: false,
		isDatingAllowed: false,
		isGamblingAllowed: false,
		isPregnancyAndParentingAllowed: false,
		isWeightLossAllowed: false,
	},
	showActiveCommunities: true,
	showMessagesInInbox: false,
	showNotifications: prefs.live_orangereds,
	showPresence: prefs.show_presence,
	showTwitter: prefs.show_twitter,
	showUsernameMentionNotifications: prefs.monitor_mentions,
	sort: "hot",
	stylesEnabled: prefs.show_stylesheets,
	subreddit: {},
	subscriptionsPinned: false,
	thirdPartyDataPersonalizedAds: prefs.third_party_data_personalized_ads,
	thirdPartyPersonalizedAds: prefs.third_party_personalized_ads,
	thirdPartySiteDataPersonalizedAds: prefs.third_party_site_data_personalized_ads,
	thirdPartySiteDataPersonalizedContent: prefs.third_party_site_data_personalized_content,
	topContentDismissalTime: null,
	topContentTimesDismissed: 0,
	useMarkdown: true,
});

export async function addPrefsV1ToState(state: State) {
	try {
		const prefs = await getREST<PrefsV1>("/api/v1/me/prefs?raw_json=1");
		if (!prefs) return;
		state.user.prefs = convertPrefsV1ToState(prefs);
	} catch {}
};


type AccountState = State['user']['account'];

interface GetAccountResponse {
	identity: {
		id: string;
		createdAt: string;
		email: string;
		isEmailPermissionRequired: boolean;
		isSuspended: boolean;
		isModerator: boolean;
		suspensionExpiresAt: string | null;
		isEmailVerified: boolean;
		isPasswordSet: boolean;
		isForcePasswordReset: boolean;
		isNameEditable: boolean;
		isSubredditCreationAllowed: boolean;
		preferences: {
			isTopKarmaSubredditsShown: boolean;
		};
		paymentSubscriptions: Array<{
			productType: string;
			status: string;
			startedAt: string | null;
			expiresAt: string | null;
			nextPaymentAt: string | null;
		}>;
		linkedIdentities: Array<{
			issuer: string;
		}>;
		phoneNumber: {
			code: string;
			number: string;
		} | null;
		inbox: {
			unreadCount: number;
		};
		modMail: {
			isUnread: boolean;
		};
		redditor: {
			id: string;
			name: string;
			prefixedName: string;
			accountType: string;
			isEmployee: boolean;
			isFriend: boolean;
			isGilded: boolean;
			isProfileHiddenFromSearchEngines: boolean;
			isAcceptingChats: boolean;
			isAcceptingFollowers: boolean;
			cakeDayOn: string | null;
			snoovatarIcon: {
				url: string | null;
			} | null;
			profile: {
				id: string;
				createdAt: string;
				isUserBanned: boolean;
				isDefaultBanner: boolean;
				path: string;
				socialLinks: Array<{
					__typename: string;
					id: string;
					type: string;
					title: string;
					handle: string;
					outboundUrl: string | null;
				}>;
				brandTools: {
					__typename: string;
					isBrandDataAvailable: boolean;
					status: string;
				} | null;
				isSubscribed: boolean;
				isTopListingAllowed: boolean;
				allowedPostTypes: Array<string>;
				description: {
					richtext: Array<any>;
				};
				isNsfw: boolean;
				title: string | null;
				subscribersCount: number | null;
				isDefaultIcon: boolean;
				isContributor: boolean;
				publicDescriptionText: string | null;
				moderatorsInfo: {
					edges: Array<{
						node: {
							id: string;
						};
					}>;
				};
				styles: {
					icon: string | null;
					legacyPrimaryColor: string | null;
					legacyIcon: {
						url: string | null;
						dimensions: {
							width: number;
							height: number;
						};
					} | null;
					profileBanner: string | null;
				};
				postFlairTemplates: Array<{
					id: string;
					text: string;
					type: string;
					richtext: Array<any>;
					isModOnly: boolean;
					maxEmojis: number | null;
					allowableContent: Array<string> | null;
					isEditable: boolean;
					backgroundColor: string | null;
					textColor: string | null;
				}>;
			};
			profileExemptedExperiments: Array<string>;
			isProfileContentFiltered: boolean;
			karma: {
				total: number;
				fromPosts: number;
				fromComments: number;
			};
			contributionStats: {
				postCount: number;
				commentCount: number;
			};
			trophyCase: Array<{
				name: string;
				totalUnlocked: number;
			}>;
			isPremiumAvatarTreatment: boolean;
		};
	};
}

interface GetAccountVariables {
	paymentEnvironment: string;
	includePremiumAvatarTreatment: boolean;
	includeBrandToolsStatus: boolean;
	includePostFlairTemplates: boolean;
	isLiteUser: boolean;
}


export async function addIdentityToState(state: State) {
	const response = await gqlFetch<GetAccountResponse>("GetAccount", "cc110720ae2587093ea7731a3d90416d6ee80f7ff047afb0ff63226d6bd9eb14", {
		includePremiumAvatarTreatment: true,
		includeBrandToolsStatus: false,
		includePostFlairTemplates: false,
		isLiteUser: true,
	} as GetAccountVariables);
	const identity = response.identity;
	if (!identity) {
		// @ts-ignore
		state.user.account = null;
		return;
	}

	const redditor = identity.redditor;

	state.user.account = {
		// @ts-ignore
		accountIcon: redditor.profile.styles.icon ?? null,
		canCreateSubreddit: identity.isSubredditCreationAllowed,
		coins: 0,
		created: Date.parse(identity.createdAt),
		displayText: redditor.name,
		// @ts-ignore
		goldExpiration: null,
		hasExternalAccount: identity.linkedIdentities?.length > 0,
		hasGoldSubscription: identity.paymentSubscriptions.some(sub => sub.productType === "GOLD" && sub.status === "ACTIVE"),
		hasPaypalSubscription: identity.paymentSubscriptions.some(sub => sub.productType === "PAYPAL" && sub.status === "ACTIVE"),
		hasStripeSubscription: identity.paymentSubscriptions.some(sub => sub.productType === "STRIPE" && sub.status === "ACTIVE"),
		hasUnreadMail: identity.inbox.unreadCount > 0,
		hasUnreadModmail: identity.modMail.isUnread,
		hasUnreadOldModmail: false,
		hasUserProfile: redditor.profile !== null,
		hasVerifiedEmail: identity.isEmailVerified,
		id: identity.id,
		inboxCount: identity.inbox.unreadCount,
		inRedesignBeta: true,
		isEmployee: redditor.isEmployee,
		isFPR: identity.isForcePasswordReset,
		isGold: false,
		isMod: identity.isModerator,
		isNameEditable: identity.isNameEditable,
		isPasswordSet: identity.isPasswordSet,
		isSuspended: identity.isSuspended,
		karma: {
			fromComments: redditor.karma.fromComments,
			fromPosts: redditor.karma.fromPosts,
			total: redditor.karma.total,
			fromAwardsGiven: 0,
			fromAwardsReceived: 0,
		},
		nightmode: state.user.prefs.nightmode,
		profileId: redditor.profile.id,
		seenLayoutSwitch: true,
		seenRedesignModal: true,
		seenSubredditChatFtux: true,
		showRecentPosts: true,
		showTrending: true,
		// @ts-ignore
		snoovatarFullBodyAsset: redditor.snoovatarIcon?.url ?? null,
		// @ts-ignore
		suspensionExpirationUtc: identity.suspensionExpiresAt ? Date.parse(identity.suspensionExpiresAt) : null,
		url: redditor.profile.path,
	};

	(state.features.socialLinks as any)[redditor.name.toLowerCase()] = redditor.profile.socialLinks;

	state.user.loid = getLoidState();
	state.user.session = {
		accessToken: window.tokenCache.token,
		expires: new Date(window.tokenCache.expires).toISOString(),
		expiresIn: window.tokenCache.expires - Date.now(),
		unsafeLoggedOut: false,
		safe: true
	};
}