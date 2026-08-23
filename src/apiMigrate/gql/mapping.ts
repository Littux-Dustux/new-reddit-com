import modNoteCountFix from "./modNoteCountFix";
import { mapBadgeIndicators, notificationsInboxFix } from "./notificationsFix";
import { fixSearchTypeaheadResp, processGeneralSearch } from "./search";
import { getREST } from "../../api/rest";
import { subredditNameToId } from "../gateway/mappers/subreddit";
import { gqlFetch } from "../../api/gql";
import { fixAwardIconSize } from "./helpers/award";
import { fixGqlListing, fixGqlPost, fixPopularElements, handlePostFeedAndOtherDiscussions } from "./helpers/post";
import { getState } from "../../main";
import { addModSubToState } from "../../state/addModeratedSubs";
import { isUserCurationActive } from "../gateway/listingPage";

export type OldOperation = (
	| "CreatorStats"
	| "UpdateRecommendationPreferences"
	| "DeleteSubredditMuteSettings"
	| "FetchEligibleUXExperiences"
	| "LanguageSelections"
	| "MutedSubreddits"
	| "StoreUxTargetingAction"
	| "UpdateSpokenLanguagesPreference"
	| "UpdateSubredditMuteAndNotificationLevelSettings"
	| "UpdateSubredditMuteSettings"
	| "Frontpage"
	| "SubredditGeoRecommendationViaFocusVertical"
	| "RegisterWebPushToken"
	| "AllUserMultireddits"
	| "MultiredditListing"
	| "SubredditTypeaheadSearch"
	| "GetRelatedCommunityRecommendations"
	| "ProxyAuthor"
	| "ModInsightsModQueueEntrypoint"
	| "CommentsPageExtra"
	| "OtherDiscussions"
	| "PostFeedAndOtherDiscussions"
	| "SubredditPosts"
	| "SubredditsPosts"
	| "CancelEconRecurringPayment"
	| "ConfirmPaypalPayment"
	| "ConfirmStripePaymentNewCard"
	| "ConfirmStripePaymentSavedCard"
	| "CreateEconOrder"
	| "CreatePaymentIntent"
	| "CreatePaypalPayment"
	| "CreateStripePaymentWithProvidedCard"
	| "CreateStripePaymentWithProvidedNonAuthCard"
	| "CreateStripePaymentWithSavedCard"
	| "DeleteSavedStripeCard"
	| "DeleteSocialLinks"
	| "GetAccountGender"
	| "GlobalProductOffers"
	| "PremiumProductOfferSubscriptions"
	| "ProductOffers"
	| "PurchaseCatalogProductOffers"
	| "SetSocialLinks"
	| "SocialLinks"
	| "UpdateAccountGender"
	| "UpdateSocialLinks"
	| "UserSavedStripeCards"
	| "CommentToxicity"
	| "CreateComment"
	| "CreateLiveAudioRoomOnProfile"
	| "CreateLiveAudioRoomOrError"
	| "GetAvailableAudioRoomTopics"
	| "GetSubredditAllowedPostTypes"
	| "GetUserProfileAllowedPostTypes"
	| "PostGuidanceValidation"
	| "PrepareLiveAudioRoom"
	| "PrepareLiveAudioRoomOnProfile"
	| "ReportTalk"
	| "StartLiveAudioRoom"
	| "UpdateComment"
	| "UpdateCommentFollowState"
	| "ProfileDownvoted"
	| "ProfileGivenGildings"
	| "ProfileHidden"
	| "ProfileHistoryPosts"
	| "ProfileReceivedGildings"
	| "ProfileSaved"
	| "ProfileUpvoted"
	| "AddApprovedTalkHost"
	| "AllModerators"
	| "DeleteScheduledPost"
	| "DoesUserHavePostModPermission"
	| "FetchModerationLogActions"
	| "FetchSubredditTrafficStats"
	| "GetSubredditWelcomeMessage"
	| "HogwartsMutation"
	| "LastModActionInSubreddit"
	| "ModActivitySummaryByID"
	| "ModerationActionCategories"
	| "RedditorIdByName"
	| "RedditorNameById"
	| "RemoveApprovedTalkHost"
	| "SetSubredditYearInReviewAvailability"
	| "SingleCommentById"
	| "SinglePostInfoById"
	| "SubmitScheduledPost"
	| "SubredditApprovedTalkHosts"
	| "SubredditFlairedRedditorByName"
	| "SubredditFlairedRedditors"
	| "SubredditWiki"
	| "SubredditWikiBannedContributors"
	| "SubredditWikiContributors"
	| "SubredditWikiPageSettings"
	| "UpdateSubredditWelcomeMessage"
	| "WikiComparisonDiff"
	| "WikiRevisions"
	| "CompleteCommunityProgressCard"
	| "CompleteCommunityProgressModule"
	| "DismissCommunityProgressCard"
	| "DismissCommunityProgressCardV2"
	| "SubredditUserAchievements"
	| "UpdateAchievementFlairPreference"
	| "AddPredictionDrafts"
	| "BadgeIndicators"
	| "BlockAwarder"
	| "CancelPrediction"
	| "ChangePrediction"
	| "ChangePredictionVote"
	| "ChatTabLiveChats"
	| "CommentsPageLastAuthorModNotes"
	| "CreateChatChannelInviteLink"
	| "CreateLiveChatAssociation"
	| "CreateMediaUploadLease"
	| "CreateModUserNote"
	| "CreatePredictionTournament"
	| "CreateScheduledPost"
	| "CreateSubredditTags"
	| "CrowdControlLevelInfo"
	| "CustomerSurveyConfig"
	| "CustomerSurveySteps"
	| "DeleteInboxNotifications"
	| "DeleteLiveChatAssociation"
	| "DeleteModUserNote"
	| "EndPredictionTournament"
	| "ExperimentVariants"
	| "FetchBlockedRedditorsInfo"
	| "FetchContentControls"
	| "FetchGlobalTags"
	| "FetchSubredditTags"
	| "FetchSubredditUserFlairTemplates"
	| "FetchSubredditsNotificationSettings"
	| "GeneralSearch"
	| "GeneralSearchOptimized"
	| "GetCommentById"
	| "GetDevPlatformMetadata"
	| "GetModUserNotes"
	| "GetPostReactInfo"
	| "GetPredictionChipPackages"
	| "GetPredictionCreationAllowance"
	| "GetPredictionToken"
	| "GetSingleDynamicConfig"
	| "GetSubredditCountrySiteSettings"
	| "GetSubredditQuestions"
	| "GetSubredditSettings"
	| "GetTotalModNoteCount"
	| "GetTournaments"
	| "GetTournamentsBaseInfo"
	| "MaybeDeleteTagsAndUpdateItemTags"
	| "ModApprove"
	| "ModQueueItems"
	| "ModQueueTriggers"
	| "ModRemove"
	| "ModeratedSubreddits"
	| "NotificationInboxFeed"
	| "NotificationInboxFeedSlimmed"
	| "NotificationSettingsLayoutByChannel"
	| "OpenAISubRecWithDetail"
	| "PollVote"
	| "PopularFeedElements"
	| "PostIsTrackingCrossposts"
	| "PrivacyPreferences"
	| "ProfileFeed"
	| "ProfileModHubPage"
	| "ProfileTrophies"
	| "RedditorKarma"
	| "RedditorMultireddits"
	| "ReportMessage"
	| "ResolvePrediction"
	| "RichTextPostContent"
	| "SendbirdChannels"
	| "SubmitMediaUpload"
	| "SubredditAbout"
	| "SubredditAchievementFlairs"
	| "SubredditChatChannelRecommendations"
	| "SubredditCustomEmojis"
	| "SubredditInfo"
	| "SubredditPage"
	| "SubredditPageExtra"
	| "SubredditPostFlairStyleTemplates"
	| "SubredditRecommendations"
	| "SubredditRules"
	| "SubredditScheduledPosts"
	| "SubredditStyles"
	| "SubredditTopContent"
	| "SubredditTopPredictors"
	| "SubredditTournamentLeaderboard"
	| "SubredditsCarousel"
	| "SubscribedSubreddits"
	| "TopAwardedPosts"
	| "TopAwardersLeaderboard"
	| "TopicBySlug"
	| "TrendingSearches"
	| "UpdateChatMessagesAsRead"
	| "UpdateCommentDistinguishState"
	| "UpdateCommentStickyState"
	| "UpdateHatefulContentFilters"
	| "UpdateInboxActivitySeenState"
	| "UpdateNotificationPreferences"
	| "UpdatePostDistinguishState"
	| "UpdatePostFollowState"
	| "UpdatePostNsfwState"
	| "UpdatePostRequirements"
	| "UpdatePostStickyState"
	| "UpdatePredictionTournament"
	| "UpdateReportState"
	| "UpdateScheduledPost"
	| "UpdateSensitiveAdsPreferences"
	| "UpdateSubredditCountrySiteSettings"
	| "UpdateSubredditNotificationSettings"
	| "UpdateSubredditPrimaryTag"
	| "UpdateSubredditSettings"
	| "UpdateSubredditTagStatesRelevance"
	| "UpdateVideoContentPermissionsSetting"
	| "UploadV2Events"
	| "UserDataExportEligibility"
	| "UserSubredditsNotificationsLevel"
	| "ValidateCreateSubreddit"
	| "VotePrediction"
	| "WhereToPostSubRec"
	| "AvatarListingById"
	| "ChangeStripePaymentMethod"
	| "ClaimAwardOffer"
	| "EconAdminPanelQuery"
	| "FetchSpecialEvents"
	| "GetArtistById"
	| "GetDynamicLayout"
	| "GetIsLiveContentAvailable"
	| "GiveCoins"
	| "MatrixChatNotifications"
	| "PerformEconAdminAction"
	| "PersonalizedYearInReview"
	| "RedditorsInfoByIds"
	| "RemoveCoins"
	| "SearchTypeahead"
	| "SearchTypeaheadByType"
	| "AwardSheetInfo"
	| "AwardSheetInfoForProfile"
	| "CreateCommunityAward"
	| "CreateGlobalAward"
	| "CreateModAward"
	| "DisableAwardInCommunity"
	| "EnableAwardInCommunity"
	| "GlobalAwards"
	| "HideAwardOnTarget"
	| "ManageableAwards"
	| "ManageableAwardsForProfile"
	| "RemoveCommunityAward"
	| "EventPostsBySubredditName"
	| "SubmitContentRatingSurvey"
	| "GetNearbySubreddits"
	| "InterestTopics"
	| "InterestTopicsByIds"
	| "UpdateTopicPreferences"
	| "AppealEligibility"
	| "RequestAppeal"
	| "AvailableAwards"
	| "AwardSideEffectsDetails"
	| "GildComment"
	| "GildPost"
	| "GiveAward"
	| "RemoveAward"
	| "SubredditCoins"
	| "CountrySiteHomeFeed"
	| "FetchLiveDiscoveryContent"
	| "UpdateCrowdControlFilter"
	| "UpdateCrowdControlLevel"
	| "GeoContributableSubreddits"
	| "GeoPlaceAutocomplete"
	| "SetSubredditGeoPlace"
	| "SuggestSubredditGeoPlace"
	| "PostSetById"
	| "ProfileFollowers"
	| "ReportPost"
	| "RequestUserDataExport"
	| "ReportComment"
	| "ReportForm"
	| "SubredditsWithAboutInfo"
	| "RecordCommunityAnswer"
	| "GetTopKarmaSubreddits"
	| "CreateCustomEmoji"
	| "DeleteCustomEmoji"
	| "GenerateCustomEmojiUploadLease"
	| "GetModPnSettingsLayout"
	| "UpdateModPnSettingStatus"
	| "UpdateModPnSettingThreshold");

type Migrater = {
	operationName: string;
	sha256Hash?: string;
	process?: (vars: Record<string, any>) => Promise<string>;
	mapVars?: (vars: Record<string, any>) => Record<string, any>;
	mapResp?: (resp: Record<string, any>) => Record<string, any>;
	hardcodedResp?: string;
	useShredditGqlProxy?: boolean;
};

type GqlFedMapping = Partial<Record<OldOperation, Migrater>>;

/* helpers */
const hardcodedMutation = (name: string) =>
	JSON.stringify({
		data: {
			[name]: {
				ok: false,
				errors: [{ message: "Deprecated" }],
			},
		},
	});

const hardcodedQuery = (name: string) =>
	JSON.stringify({
		data: {
			[name]: null,
		},
		errors: [
			{
				message: "Deprecated",
				path: [name],
			},
		],
	});

export const gqlFedMap: GqlFedMapping = {
	AllModerators: {
		operationName: "GetModeratorList",
		sha256Hash: "00b15ca6088f3aef8c887f54f4d70bbec5312cfef3a2a54a5efa8dbfb2b9cd83",
		mapVars: ({ subredditName }) => ({ name: subredditName }),
		mapResp: ({ subredditInfoByName }) => ({ subreddit: subredditInfoByName }),
	},
	AllUserMultireddits: {
		operationName: "MyMultireddits",
		sha256Hash: "2482bfa42b8c8ae31ee5ef76105217138e7d81e8f9bfc274fabd33d71742afe8"
	},
	AddApprovedTalkHost: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("addApprovedHostMember"),
	},
	AddPredictionDrafts: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("addPredictionDrafts"),
	},
	AppealEligibility: {
		operationName: "AppealEligibility",
		sha256Hash: "0ac7bd8c4146b1da3f4a9d8c95c6eb0d0317012da9e71d08190c31803c07e29e",
	},
	AvailableAwards: {
		operationName: "AvailableAwards",
		sha256Hash: "0d748eaa3d03cc4dbb5c6da31cdbd60aa37d3aeebbe40728707baaacd534753c",
	},
	AwardSheetInfo: {
		operationName: "SortedUsableAwardsWithTags",
		sha256Hash: "d44dfe19c0c19985410587e633838ff24c28fbd1013908b16da695fc37b43eb0",
		mapVars: ({ thingId, ...rest }) => ({ nodeId: thingId, ...rest }),
		mapResp: ({ subredditInfoById }) => ({
			subredditInfoById: {
				...subredditInfoById,
				sortedUsableAwards: subredditInfoById.sortedUsableAwards.map((awardingTotal: any) => ({
					...awardingTotal,
					award: fixAwardIconSize(awardingTotal.award),
				}))
			}
		})
	},
	AwardSheetInfoForProfile: {
		operationName: "SortedUsableAwardsForProfile",
		sha256Hash: "047bf98c22183ee3dd2daa8f542ca0b717f729a4df5b07f41dddff13ec6b68cd",
		// will break
	},
	BadgeIndicators: {
		operationName: "BadgeCount",
		sha256Hash: "6e5b40ea4193a6fcfd6890518f4cdde524e434243d055c33a552af2e42e0a433",
		//operationName: "BadgeCountV2",
		//sha256Hash: "73bcdf5b9296d1a6dbd344d4fd1989a2f50428d45bdb98a498e05e81879cc979",
		mapResp: mapBadgeIndicators
	},
	BlockAwarder: {
		operationName: "BlockAwarderByAwardingId",
		sha256Hash: "d1886b523011ed8bdcd15eda43a7ed7b60baaea42f8bf6a12dcf614fbffd4e7f",
	},
	CancelEconRecurringPayment: {
		operationName: "CancelEconRecurringPayment",
		sha256Hash: "fbbade9a554ff6ae07f634b2852bc181df809d3721f7f9a7caf52216a47d26bb",
	},
	CancelPrediction: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("cancelPrediction"),
	},
	ChangePrediction: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("changePrediction"),
	},
	ChangePredictionVote: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("changePredictionVote"),
	},
	ClaimAwardOffer: {
		operationName: "ClaimAwardOffer",
		sha256Hash: "7d96bd46393d7d1699d79c0d0291510462a23fb7d3311997740a50dcd409d466",
	},
	CompleteCommunityProgressCard: {
		operationName: "CompleteCommunityProgressCard",
		sha256Hash: "2732cfeecbf1c8d2276702a1ccf2a56a18288e76df522a4d2625054af3dd6985",
	},
	CompleteCommunityProgressModule: {
		operationName: "CompleteCommunityProgressModule",
		sha256Hash: "07d435bed20c9430726d70cc3c791529958868135b9ef193f2cdd3896004cf9e",
	},
	CreateChatChannelInviteLink: {
		operationName: "CreateChannelLink",
		sha256Hash: "eafd7def47d88d873c057ff850d6b1c0185416dc23458b8f16ad32d047074408",
	},
	CreateComment: {
		operationName: "CreateComment",
		sha256Hash: "3b5a06e1cb58a48cb9d59c88f150ba491e9c1e9e775b80df938842bc7f828247",
	},
	CreateCustomEmoji: {
		operationName: "CreateCustomEmoji",
		sha256Hash: "95d93da8f7d9be1847d1e665613a74e2e2448188a967bd179073053f0d41ff13",
	},
	CreateEconOrder: {
		operationName: "CreateEconOrder",
		sha256Hash: "d0112528e006b811bfcc4dc58e575d007a6f036054ed1eec43bf2106f1d4a630",
	},
	CreateLiveAudioRoomOnProfile: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("createAudioRoomOnProfile"),
	},
	CreateLiveAudioRoomOrError: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("createAudioRoomOrError"),
	},
	CreateLiveChatAssociation: {
		operationName: "CreateLiveChatAssociation",
		sha256Hash: "8d0b08a741d21ce610c517e38a2a95264478dacf4678d5f2157d162db7212eb0",
	},
	CreateMediaUploadLease: {
		operationName: "CreateMediaUploadLease",
		sha256Hash: "c424ecd285f4cecf3ab5b978829ea035c385bb132c1968407f1f0032e31815fe",
	},
	CreateModUserNote: {
		operationName: "CreateModUserNote",
		sha256Hash: "563a4b33f42081fd2cc4e974f48806e68a4bd5c0662049eb5d6a4ae3fc01f485",
	},
	CreatePredictionTournament: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("createPredictionTournament"),
	},
	CreateScheduledPost: {
		operationName: "CreateScheduledPostLink",
		sha256Hash: "360d996af697c7b0f6ac3435977c7a4a2d9cb6cfc7080df94a9b9fff834bb646",
	},
	CreatorStats: {
		operationName: "CreatorStats",
		sha256Hash: "1967e4edfd77d0e37d7d384c7f4e67307a0b91e31e87569e3d8d31a4f461df7d"
	},
	CrowdControlLevelInfo: {
		operationName: "CrowdControlForPost", // iOS app
		sha256Hash: "52a4fc7c2fbfd85f8c9d498b3524795b9f0c047f112a1a03c636ad2cbc6a2c02",
		mapVars: ({ postId }) => ({ id: postId })
	},
	CustomerSurveyConfig: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedQuery('customerSurveyConfig')
	},
	DeleteCustomEmoji: {
		operationName: "DeleteCustomEmoji",
		sha256Hash: "0f8dcacc41a5dc0565847f15f955e5612d94d2f4672bccabbcf344190ba41138",
	},
	DeleteInboxNotifications: {
		operationName: "DeleteInboxNotifications",
		sha256Hash: "9728f59800f6eff9db01382064d5afffef0ef2c7162523880254e020a2cc798e",
	},
	DeleteLiveChatAssociation: {
		operationName: "DeleteLiveChatAssociation",
		sha256Hash: "ca3febf488bc7118b942c3c4442f4307a98133e1d8e7d15d5ccab2b189aa3c90",
	},
	DeleteModUserNote: {
		operationName: "DeleteModUserLog",
		sha256Hash: "b918cff8c862bcf959ff21a69ffafb5d72c865b305c4121c0a0c8c6f363956ca",
	},
	DeleteScheduledPost: {
		operationName: "DeleteScheduledPost",
		sha256Hash: "54fd5bf6f7869ddb5a1c4422aeef65f325ca2ab9167b5926155cd962fc3f113f",
	},
	DeleteSocialLinks: {
		operationName: "DeleteSocialLinks",
		sha256Hash: "12ebe553f9e7cadcd167d1942f66e7739271bc2bc33d34714781b76dcf4b8e48",
	},
	DeleteSubredditMuteSettings: {
		operationName: "DeleteSubredditMuteSettings",
		sha256Hash: "58efe4d8a3214b30e6518bd6bd2fcad5a1e2f152bad494957a33573d4a7b7b02",
	},
	DismissCommunityProgressCard: {
		operationName: "DismissCommunityProgressCard",
		sha256Hash: "9876b8ed26656650b4f66933a8bcf7dc93bcc1cb885af7a90c3fcf29021043f4",
	},
	EndPredictionTournament: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation("endPredictionTournament"),
	},
	FetchBlockedRedditorsInfo: {
		operationName: "BlockedUsers",
		sha256Hash: "fa5eb1e1571640206b77152f9f8f104e2aada8c53fdb420ba0202393f0f9ea0d",
	},
	FetchContentControls: {
		operationName: "GetPostRequirements",
		sha256Hash: "0465f6238026c63c1688696b323fb987de6372459b8f873bf36fd6a8a4e38421",
		mapResp: ({ subredditInfoById }) => ({ subreddit: subredditInfoById }),
	},
	FetchEligibleUXExperiences: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedQuery("eligibleUxExperiences"),
	},
	FetchGlobalTags: {
		operationName: "GlobalTopics",
		sha256Hash: "5cad3e034a2e891e2c60f58210f51a811dd796204c4446c23b2fedb1f25026f4",
	},
	FetchLiveDiscoveryContent: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedQuery("liveDiscoveryContent"),
	},
	FetchModerationLogActions: {
		operationName: "GetModLog", // not sure if this is the correct mapping
		sha256Hash: "4b8dadf5786d05bef6375bea1ae1666e5c2033858aad2f02ef5f4bcc86e0e45f",
		mapVars: ({ subredditName, ...rest }) => ({ subredditId: subredditNameToId[subredditName], ...rest }),
		mapResp: ({ subredditInfoById }) => ({ subreddit: subredditInfoById })
	},
	FetchSpecialEvents: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedQuery("econSpecialEvents"),
	},
	FetchSubredditsNotificationSettings: {
		operationName: "GetSubredditNotificationSettings",
		sha256Hash: "93dcfc93eb8ed76c4fb5025ca38bbc470c8fc471246d99f910d55e98b44ee66b",
		mapVars: ({ subredditIds }) => ({ ids: subredditIds })
	},
	FetchSubredditTags: {
		operationName: "<hardcoded>",
		hardcodedResp: '{"data":{"subredditInfoById":{"secondaryTags":{"edges":[]},"availableTags":{"edges":[]},"suggestedTags":{"edges":[]}}}}'
	},
	FetchSubredditTrafficStats: {
		operationName: "EnhancedInsightsSummary", // got this from the 2026 reddit app. couldn't find one in the 2023 app. everything else here is from the 2023 app.
		sha256Hash: "75f4ae53a1025e52b9f4dc4e06917a6dcf5a73a3913f303822256d821b052f71",
	},
	FetchSubredditUserFlairTemplates: {
		operationName: "GetCommunityFlairForSelfPickerData",
		sha256Hash: "17e5b5c12054899fe24a9de98e82a5c139e7d056cd70701f42717c7820ee3e2a",
	},
	Frontpage: {
		operationName: "HomeElements",
		//sha256Hash: "a85f0afccfd8c623355a4ca3b144781eea668836ae02d2bf1bf298f26f74f2f1", // 2023 android app
		sha256Hash: "60f2737fad67382ef010e4e65f9c921f85f767ff8a3426a17157a70ed6a1ee41", // 2024 android app
		mapVars: (vars) => ({
			...vars,
			advancedConfiguration: {
				eligibleExperienceOverrides: [],
				propertyProviderOverrides: []
			},
			experienceInputs: ["REONBOARDING_IN_FEED", "VIRAL_COMMUNITY_XPROMO", "ANNOUNCEMENT_IN_FEED"]
		}),
		mapResp: ({ postFeed, ...rest }) => ({
			home: {
				elements: fixGqlListing(postFeed.elements),
			},
			...rest
		}),
		/* operationName: "Frontpage",
		useShredditGqlProxy: true,
		mapVars: ({ pageSize, ...rest }) => ({
			first: pageSize,
			navigationSessionId: rest.feedRankingContext.servingId,
			includeAwards: true,
			...rest
		}),
		mapResp: ({ feed }) => ({
			home: {
				elements: fixGqlListing(feed.elements)
			}
		}) */
/*
{
      after: "",
      distance: 4,
      navigationSessionId: "",
      cursor: "",
      sort: "BEST"
    }
		operationName: "<FIXME>",
		hardcodedResp: JSON.stringify({
			data: {
				identity: null,
				home: {
					posts: null,
				},
				trendingSubreddits: null,
				recentPosts: [],
				featuredAnnouncement: null,
				feauredLiveEvent: null,
			},
			errors: [
				{ message: "todo", path: ["home", "posts"] },
				...["identity", "trendingSubreddits", "recentPosts", "featuredAnnouncement", "feauredLiveEvent"].map((field) => ({
					message: "todo",
					path: [field],
				})),
			],
		}),
*/
	},
	GeneralSearch: {
		operationName: "SearchPosts", // might be correct
		process: processGeneralSearch,
	},
	GeneralSearchOptimized: {
		operationName: "SearchPosts:Optimized",
		process: processGeneralSearch,
	},
	GenerateCustomEmojiUploadLease: {
		operationName: "GenerateCustomEmojiUploadLease",
		sha256Hash: "1d0167deb7fbc57dce90cfa15c589683e02c6b7967d6645fad7989ddbffeda1e",
	},
	GeoContributableSubreddits: {
		operationName: "GeoContributableSubreddits",
		sha256Hash: "cf4c82f8450a88f09e02df4f498691982883630809ec23890b2dcb54d8ed30a1",
	},
	GeoPlaceAutocomplete: {
		operationName: "GeoPlaceAutocomplete",
		sha256Hash: "dbc69fa5be4ed4c95aad4874c579ae057c578c92fba72147f86e008462ed9f27",
	},
	GetAccountGender: {
		operationName: "GetGender",
		sha256Hash: "cfb010e71a61b85f4eb49294d69fb8e8ed7bdb72b430314d04555b4abd1acfe3",
	},
	GetAvailableAudioRoomTopics: {
		operationName: "<hardcoded>",
		hardcodedResp: '{"data":{"availableAudioRoomTopics":[]}}',
	},
	GetCommentById: {
		operationName: "GetCommentById",
		sha256Hash: "2fe82f19f25b77c0298e6d57598f4badbba17a16670f7712b9903bbdfbf376fb",
	},
	GetDevPlatformMetadata: {
		operationName: "GetDevPlatformMetadata",
		sha256Hash: "856bee1ed839deb100f036656ac530aa67c401554e94bef3c3bae4a57434155f",
		hardcodedResp: '{"data":{"subredditInfoByName":{"__typename":"Subreddit","devPlatformMetadata":"e30="}}}'
	},
	GetModPnSettingsLayout: {
		operationName: "GetModPnSettingsLayout", // used the 2026 one here because it's probably more suitable
		async process({ subredditIds: [subredditId]}) {
			const { subredditInfoById } = await gqlFetch(
				"GetModPnSettingsLayout",
				"63b8a9fe8b50c8a4f343777fd6703d8dc11de7821ceb088f21eed1e33debc6ea",
				{ subredditId },
			);
			subredditInfoById.id = subredditId;
			return JSON.stringify({
				data: {
					subredditsInfoByIds: [subredditInfoById]
				}
			});
		}
	},
	GetModUserNotes: {
		operationName: "GetModUserNotes", // thank you u/RVL-003
		sha256Hash: "9e56625bc7cad25002dbc418aa878144356cccbd2cd7c6eb64e4ab30f9146f41",
		mapVars({ subredditId, userId, ...otherVariables }) {
			return { subredditID: subredditId, userID: userId, ...otherVariables };
		},
	},
	GetNearbySubreddits: {
		operationName: "<hardcoded>",
		hardcodedResp: '{"data":{"nearbySubreddits":{"edges":[]}}}',
	},
	GetRelatedCommunityRecommendations: {
		operationName: "RelatedSubreddits",
		sha256Hash: "d8f3e2d9734263522a46ba5d7ee7c19790cd975e79533753df19f7503ace43e2",
	},
	/*
	GetSingleDynamicConfig: {
		operationName: "DynamicConfigsByNames",
		sha256Hash: "30383254f78b1781a7e755f1cf06c71b10b3de5cf2f8d64a5677b80da02fecb3",
		// Might be wrong
		// update: it was wrong
		mapVars({ name, type }) {
			return { names: [{ name, type }] };
		},
		mapResp({ dynamicConfigsByNames: confs }) {
			return { dynamicConfigByName: confs[0] ?? null };
		},
	},
	*/
	GetSingleDynamicConfig: {
		operationName: "",
		hardcodedResp: hardcodedQuery("dynamicConfigByName")
	},
	GetSubredditAllowedPostTypes: {
		operationName: "GetPostTypes", // 2026 app
		sha256Hash: "11cc8773a678e5367f3927e6fdbfd62b10e52c35aa6ee574374e04e550658890",
	},
	GetSubredditCountrySiteSettings: {
		operationName: "GetSubredditSettings", // inefficient but it's the only way i can find this info
		sha256Hash: "6dd06f2120bf8ed8abc10095b55744bbf331a9ac8f7dcc02c2cee72938ea5fb0",
		mapVars: ({ subredditId }) => ({ id: subredditId })
	},
	GetSubredditQuestions: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedQuery("subredditInfoByName"),
	},
	GetSubredditSettings: {
		operationName: "GetSubredditSettings",
		sha256Hash: "6dd06f2120bf8ed8abc10095b55744bbf331a9ac8f7dcc02c2cee72938ea5fb0",
		mapVars: ({ subredditName }) => ({ id: subredditNameToId[subredditName] })
	},
	GetSubredditWelcomeMessage: {
		operationName: "GetWelcomeMessageForSubreddit",
		sha256Hash: "5696b3e43f8a0cd8ad7bc2df9774baaad2ab780bf971bf24d06ce9a1adbaba55",
	},
	GetTopKarmaSubreddits: {
		operationName: "GetTopKarmaSubreddits",
		sha256Hash: "4edd4bdf9d6801412173dc5dd18e05ca8812fa54675b1856a2b775b7d47567c2",
	},
	GetTotalModNoteCount: {
		operationName: "GetModUserLogsCounts",
		process: modNoteCountFix,
	},
	GetUserProfileAllowedPostTypes: {
		operationName: "ProfileDetailsByName", // inefficient, and probably doesn't work
		sha256Hash: "096ccf5d943485822cb6d3e0dc13f9977da1984514e1d539e1ed38a51158e689",
	},
	GildComment: {
		operationName: "GildComment",
		sha256Hash: "3c416bba302f0662895c5b2fdfd15e2c2381f202e2808d4af7179216e9b2b705",
	},
	GildPost: {
		operationName: "GildPost",
		sha256Hash: "bcca11bf6ac7b461d17cc69ac96afd8352c46a11ccd3a239142d122457ec560b",
	},
	GiveAward: {
		operationName: "GiveAward",
		sha256Hash: "068601e87e0e3e26dbcc389834881e659a86ea369fb445598814423d76c959ee",
	},
	GlobalProductOffers: {
		operationName: "GlobalProductOffers",
		sha256Hash: "4fab95172d9a6b1c20701ecc61c255aabe26b74017f6cc05e3b296af028e1dbc",
	},
	HideAwardOnTarget: {
		operationName: "HideAwardOnTarget",
		sha256Hash: "a2325c649e978180f351e47ce83243c4ccfd9d3041e4979f60ce49f38ab1f711",
	},
	InterestTopics: {
		operationName: "InterestTopics",
		sha256Hash: "766001b296654ad51afe428cbbc5ac2d2f32d57fb1f797354ac7e2de66bad850",
	},
	InterestTopicsByIds: {
		operationName: "InterestTopicsByIds",
		sha256Hash: "38268395dac1c8c1613665c729a51da18dc21694f8ec417b032abe1004e5ef59",
	},
	LanguageSelections: {
		operationName: "ContentLanguages+SpokenLanguages",
		async process({ allKey, suggestedKey }) {
			const [spokenLanguages, allList, suggestedList] = await Promise.all([
				gqlFetch("SpokenLanguages", "84dba115e7924bc81f38962b8c1f158d25acccdc6fa8400c9ac570ee3f0335dd", {}),
				gqlFetch("ContentLanguages", "a2633f43bda02b926b17cfc0d9697085c43276cb9884fdf26133082f0f282300", { listKey: allKey }),
				gqlFetch("ContentLanguages", "a2633f43bda02b926b17cfc0d9697085c43276cb9884fdf26133082f0f282300", { listKey: suggestedKey })
			]);
			return JSON.stringify({
				data: {
					...spokenLanguages,
					all: allList.languagesList,
					suggested: suggestedList.languagesList,
				}
			});
		}
	},
	MatrixChatNotifications: {
		operationName: "IdentityMatrixNotifications",
		sha256Hash: "95192e490742fec36721e64002e1913e6f0dfc746b6033f31c37f8b8689595f6",
	},
	ModApprove: {
		operationName: "ModActionApproveContent",
		sha256Hash: "95308910a099aeec9ab409475bae1ccc6ff46f15ebfba5dcb17c66aec68c6962",
	},
	ModeratedSubreddits: {
		operationName: "ModeratedSubredditsByUserId",
		sha256Hash: "c8474116f0895add474ecdc4adeab316744f96baded4406c73864825c72f4338",
	},
	ModQueueItems: {
		operationName: "ModQueueItemsWithSort",
		sha256Hash: "344df6a0614db8898b0792a22823ce7984a2655f5c350c693f3eadcd1b2b7fb6",
		mapVars: ({ subredditNames, sort, ...rest }) => ({
			subredditIds: subredditNames.map((name: string) => subredditNameToId[name]),
			sortType: sort,
			...rest
		}),
		mapResp: ({ modQueueItems }) => {
			for (const { node } of modQueueItems.edges) {
				const verdictBy = node.commentInfo?.moderationInfo?.verdictByRedditorInfo;
				if (verdictBy) {
					node.commentInfo.moderationInfo.verdictBy = verdictBy;
					delete node.commentInfo.moderationInfo.verdictByRedditorInfo;
				}
			};

			return { modQueueItems };
		}
	},
	ModRemove: {
		operationName: "ModActionRemoveContent",
		sha256Hash: "dc125a9f9aac76d1ca7750b3cb2d4f6199cbae2a2acf55bd78c59ee26625641a",
	},
	ModerationActionCategories: {
		operationName: "GetModActionCategories", // found on the 2026 app
		sha256Hash: "38d6a325bdc09d7059886b10a28c2008fb9b15c57a6d68254276cdaf9de5dd8f",
	},
	ModInsightsModQueueEntrypoint: {
		operationName: "ModInsightsModQueueEntrypoint",
		useShredditGqlProxy: true
	},
	MultiredditListing: {
		// operationName: "MultiredditByPath", // found a "MultiredditPosts" too. not sure which one is correct
		// sha256Hash: "bf03e8080191cd9cf427c354f0e4538c75f700f186caff46c55ad346afca32d3",
		operationName: "MultiredditListing",
		// sha256Hash: "29fd321afe5604976850089b011cec4438e73297a4feca7ecefc50acf3c00f53",
		// mapVars: ({ path, ...rest }) => ({ multiredditPath: path, ...rest }),
		// mapResp: ({ postFeed }) => ({
		//	multireddit: {
		//		elements: postFeed.posts
		//	}
		// }),
		async process({ path, includeSources, ...rest }) {
			const [{ postFeed }, { multireddit }] = await Promise.all([
				gqlFetch(
					"MultiredditPosts", "29fd321afe5604976850089b011cec4438e73297a4feca7ecefc50acf3c00f53",
					{ multiredditPath: path, ...rest }
				),
				gqlFetch(
					"MultiredditByPath", "bf03e8080191cd9cf427c354f0e4538c75f700f186caff46c55ad346afca32d3",
					{ path, withSubreddits: includeSources }
				)
			]);

			const responseMultireddit: Record<string, any> = {
				elements: fixGqlListing(postFeed.posts)
			};

			if (includeSources && multireddit.__typename === "Multireddit") {
				const sources = Array(multireddit.subreddits.edges.length + multireddit.profiles.edges.length);
				let index = 0;

				for (const edge of multireddit.subreddits.edges) {
					if (edge.node) {
						edge.node.__typename = "Subreddit";
						edge.node.type = "PUBLIC";
						const legacyIcon = edge.node.styles?.legacyIcon;
						if (legacyIcon) legacyIcon.dimensions = {
							width: 256,
							height: 256
						}
					}
					sources[index++] = edge;
				}

				for (const edge of multireddit.profiles.edges) {
					if (edge.node) edge.node.__typename = "Profile";
					sources[index++] = edge;
				}

				responseMultireddit.sources = { edges: sources };
				delete multireddit.subreddits;
				delete multireddit.profiles;
			}

			return JSON.stringify({
				data: {
					multireddit: Object.assign(responseMultireddit, multireddit)
				}
			})
		}
	},
	MutedSubreddits: {
		operationName: "MutedSubreddits",
		sha256Hash: "0e440593782e6d97dad30dc4664509f69e78cbadcfdb040f4aff0703243460be",
	},
	NotificationInboxFeed: {
		operationName: "GetInboxNotificationFeed",
		sha256Hash: "531bb584ee0c17b0c43adf71729afa433ba683d009632406dc9d169a8fa424d0",
		...notificationsInboxFix
	},
	NotificationInboxFeedSlimmed: {
		operationName: "GetInboxNotificationFeed",
		sha256Hash: "531bb584ee0c17b0c43adf71729afa433ba683d009632406dc9d169a8fa424d0",
		...notificationsInboxFix
	},
	NotificationSettingsLayoutByChannel: {
		operationName: "GetNotificationSettingsLayoutByChannel",
		sha256Hash: "cd6a711e246f7226753d204078cd8665b2fef71266269b0505a8667234c8faf0",
	},
	OtherDiscussions: {
		operationName: "GetDuplicatePosts", // found from 2024 reddit app, thankfully
		sha256Hash: "fd557fdc121760c37dc2957d4cc103dd0eefa95926952c0adf6aad8afea1e54a",
		mapVars: ({ postId, ...rest }) => ({ id: postId, ...rest })
	},
	PersonalizedYearInReview: {
		operationName: "GetRecap",
		sha256Hash: "e5a8ea8dd762401004c4d6ffce9827fa1fefe6265308399a8544d6c3dd2e61d0",
	},
	PollVote: {
		operationName: "PollVote",
		sha256Hash: "4fd0ee0e581d1abb0d3fb583b8fa6fc16d354f855c62aeae2d733c39a6c976db",
	},
	PopularFeedElements: {
		operationName: "PopularFeedElements",
		sha256Hash: "728c0f9a4d12c17b8cffe07669bb1a8770b0f2ec0c84e040485f8fad2d9c417f",
		mapVars: (vars) => ({
			...vars,
			advancedConfiguration: {
				eligibleExperienceOverrides: [],
				propertyProviderOverrides: []
			},
			experienceInputs: ["REONBOARDING_IN_FEED", "VIRAL_COMMUNITY_XPROMO", "ANNOUNCEMENT_IN_FEED"]
		}),
		mapResp: ({ popular }) => ({
			identity: null,
			popular: {
				elements: fixPopularElements(popular.elements),
			},
			recentPosts: [],
			trendingSubreddits: []
		})
		/*
		operationName: "Popular",
		useShredditGqlProxy: true,
		mapVars: ({ pageSize, ...rest }) => ({
			first: pageSize,
			navigationSessionId: "",
			includeAwards: true,
			...rest
		}),
		mapResp: ({ feed }) => ({
			popular: {
				elements: fixPopularElements(feed.elements)
			}
		}) */
	},
	PostFeedAndOtherDiscussions: {
		operationName: "SubredditFeed+GetDuplicatePosts",
		process: handlePostFeedAndOtherDiscussions,
		
	},
	PostGuidanceValidation: {
		operationName: "ValidatePostGuidanceRules", // 2024 app
		sha256Hash: "2c398ea4052e9bc4d02f3f9ff69dc11aa460748de32601b20c6c023cd3442644",
		mapVars: ({ input }) => input,
	},
	PostSetById: {
		operationName: "PostSetSharedTo",
		sha256Hash: "48745aebb9484b8265229bac43421a41f8ae98cac1e99c31ef50a5a23754a078",
	},
	ProfileDownvoted: {
		operationName: "DownvotedPosts",
		sha256Hash: "bef6215672dd62181aa6290cf13205f01ae35aa1bc8a684cd41dddebcb922bc6",
		mapResp: ({ identity }) => ({ identity: { downvotedPosts: fixGqlListing(identity.downvotedPosts) } })
	},
	ProductOffers: {
		operationName: "GlobalProductOffers",
		sha256Hash: "4fab95172d9a6b1c20701ecc61c255aabe26b74017f6cc05e3b296af028e1dbc",
	},
	ProfileFeed: {
		operationName: "UserSubmittedPosts",
		sha256Hash: "78a213c02a340db4a707d4bcd375ce34f733b75893379603acb4ec20388fafe6",
		mapResp: ({ postFeed }) => ({ redditorInfoByName: postFeed })
	},
	ProfileFollowers: {
		operationName: "FollowedByRedditors",
		sha256Hash: "cd7f3a824a09e34fb5765767494f37b725ffad2172e479a7b188786f8425ec72", // iOS app
		mapVars: ({ first, after, searchQuery }) => ({ limit: first, from: after, searchQuery }),
		mapResp: ({ identity }) => ({
			identity: {
				followedByRedditorsInfo: identity.followedByRedditorsInfo,
				redditor: {
					moderatedSubreddits: {
						pageInfo: {},
						edges: []
					}
				}
			}
		})
	},
	ProfileHidden: {
		operationName: "HiddenPosts",
		sha256Hash: "dd50be43da2e469e529cb4c63c1d0f3c2f54c12d5e8f65a809b90ebaff0aa8e9",
		mapResp: ({ identity }) => ({ identity: { hiddenPosts: fixGqlListing(identity.hiddenPosts) } })
	},
	ProfileHistoryPosts: {
		operationName: "PostsByIds",
		sha256Hash: "eb435514e5e7cbe599e34adb2d827d36832852dde767b74d96d917b812253124",
		mapVars: ({ recentPostIds }) => ({ ids: recentPostIds }),
		mapResp: ({ postsInfoByIds }) => ({
			postsInfoByIds: postsInfoByIds.map(fixGqlPost),
			identity: { redditor: null }
		})
	},
	ProfileSaved: {
		operationName: "SavedPostsDynamicQuery",
		useShredditGqlProxy: true,
		mapResp: ({ saved }) => ({ identity: { saved }})
	},
	ProfileTrophies: {
		//operationName: "ProfileTrophies",
		//sha256Hash: "afd499fd984d22dba654280c5a59467a2288a37c6e650648e4cb35fba88960ba",
		operationName: "/user/{name}/trophies",
		process: async ({ profileName }) => JSON.stringify({
			data: {
				redditor: {
					__typename: "Redditor",
					trophies: (
						await getREST(`/user/${profileName}/trophies.json?raw_json=1`)
					).data.trophies.map(
						({ data }: any) => ({
							icon40Url: data.icon_70,
							grantedAt: data.granted_at,
							name: data.name,
							awardId: "t6_"+data.award_id,
							trophyId: "rd_"+data.id,
						})
					)
				}
			}
		})
	},
	ProfileUpvoted: {
		operationName: "UpvotedPosts",
		sha256Hash: "2576b683a14896be80b6b3b0465a55b7a94ada8f062564d2bdc1e38975bb5837",
		mapResp: ({ identity }) => ({ identity: { upvotedPosts: fixGqlListing(identity.upvotedPosts) } })
	},
	ProxyAuthor: {
		operationName: "ProxyAuthor", // iOS app
		sha256Hash: "8a264414bd43e257113b8749ff7be8609f3ad8d183bf637643614506d018656e",
	},
	RedditorIdByName: {
		operationName: "GetUserIdByName", // 2026 app
		sha256Hash: "4535fca1d94dbad56dadb03804346c41117fc4a6abb38417c4821fc7a192ee75",
	},
	RedditorKarma: {
		operationName: "Profile",
		hardcodedResp: hardcodedQuery('redditorInfoByName')
		//sha256Hash: "3d8c0385d1585b8a0b486f42eed1b2dc3504230f43fd43d136d6d16220ff99dd",
		//mapResp: ({ redditorInfoByName }) => ({ user: redditorInfoByName })
	},
	RedditorNameById: {
		operationName: "GetUserNameById",
		sha256Hash: "c522051f63d50c7cec3128baf227192187c97191199357b067d8917d98679cd7",
	},
	RedditorsInfoByIds: {
		operationName: "GetRedditUsersByIds", // thank you u/RVL-003
		sha256Hash: "c4332a3bb82908fc1383b8e44132c2e12e2104f8cf4256f09df96fdf110a6a1f",
	},
	RegisterWebPushToken: {
		operationName: "RegisterPushToken",
		useShredditGqlProxy: true,
	},
	RemoveAward: {
		operationName: "RemoveAward",
		sha256Hash: "1ceac103d13f36e2b26ccc9a1710bf33bbc98890cb15351ae82da259cda33e03",
	},
	ReportComment: {
		operationName: "ReportComment",
		sha256Hash: "6b55eb68b0c8cb0d908cba2f9801d393003a41c347e98a4906c12d137532edf9",
	},
	ReportForm: {
		operationName: "ReportForm",
		useShredditGqlProxy: true,
	},
	ReportPost: {
		operationName: "ReportPost",
		sha256Hash: "a16926790a0d91ba97d1bcf25388d78674f4e1533c076609aa0c2861acc96721",
	},
	RequestAppeal: {
		operationName: "RequestAppeal", // from 2026 app
		sha256Hash: "244f1cdc5e138c1dc1f274824094bd0b88a74d966b3efe7b54b245a4f0a48d58",
	},
	SearchTypeahead: {
		operationName: "SearchTypeahead",
		sha256Hash: "e57833412d85c454b055573ac2ac5252022458ebbe66de3734a24ad7e3c03d3b",
	},
	SearchTypeaheadByType: {
		operationName: "SearchTypeaheadByType",
		sha256Hash: "cac956cef6365ab1af09d09d1188025f785de35c1c5a1a11e19f3f20ab8622ca",
		mapResp: fixSearchTypeaheadResp,
	},
	SetSocialLinks: {
		operationName: "SetSocialLinks",
		sha256Hash: "6a8678396b5a3e1b64a47ec06005223b144a23b175108acc2a90fd78a1398240",
	},
	SingleCommentById: {
		operationName: "GetCommentById",
		sha256Hash: "2fe82f19f25b77c0298e6d57598f4badbba17a16670f7712b9903bbdfbf376fb",
	},
	SinglePostInfoById: {
		operationName: "PostsByIds",
		sha256Hash: "0e471495bcba33554b6c540b3cf1cae23dd5432a8b741dddc7fd6717dc2520a7",
		mapVars: ({ id, ...otherVariables }) => ({ ids: [id], ...otherVariables }),
		mapResp: ({ postsInfoByIds: posts }) => ({ postInfoById: posts[0] ?? null }),
	},
	SocialLinks: {
		/* // Got from Reddit themselves
		// https://github.com/reddit/devvit/blob/0eabc7abebf850bdd0b7a4c7c1bdf3feac340402/packages/reddit/src/models/User.ts#L494
		operationName: "GetUserSocialLinks",
		sha256Hash: "2aca18ef5f4fc75fb91cdaace3e9aeeae2cb3843b5c26ad511e6f01b8521593a",
		mapVars: ({ username }) => ({ name: username }),
		mapResp: ({ user }) => ({
			redditorInfoByName: {
				__typename: user ? "Redditor" : "UnavailableRedditor",
				...user
			}
		}) */
		operationName: "UserProfile",
		async process({ username }) {
			const lowerCased = username.toLowerCase();
			const fetchPromise = gqlFetch("UserProfile", "27ec8d5c561882fab3f0b1da7a20ca742db928e4f2e5e943ac3a827965d5ff4e", {
				name: lowerCased,
				includePremiumAvatarTreatment: false,
			}, { cache: true, maxCacheAge: 60e3 });

			isUserCurationActive.set(lowerCased, fetchPromise.then(
				({ redditorInfoByName }) => redditorInfoByName?.isProfileContentFiltered
			));

			const { redditorInfoByName } = await fetchPromise;
			return JSON.stringify({
				data: {
					redditorInfoByName: {
						__typename: redditorInfoByName?.__typename,
						profile: {
							socialLinks: redditorInfoByName?.profile?.socialLinks ?? [],
						}
					}
				}
			});
		}
	},
	SubmitMediaUpload: {
		operationName: "SubmitMediaUpload",
		sha256Hash: "059a8313aa6543392de0443c3b0dd4ea42e35d5a83479864804c51c92982ded9",
	},
	SubmitScheduledPost: {
		operationName: "SubmitScheduledPostNow",
		sha256Hash: "bf27450f5b05acf788d8a27ddae1d3340694408a957232008956e6d83cfe6c13",
	},
	SubredditAbout: {
		operationName: "SubredditInfoByName", // hopefully this works
		sha256Hash: "2c4e9fcfd57b11c4ca2e00e087aa243891f7e2e251192ad4a9b7b2a63d4b1b8e",
		mapResp: ({ subredditInfoByName }) => ({
			subreddit: {
				publicDescription: {
					markdown: subredditInfoByName?.publicDescriptionText
				},
				...subredditInfoByName
			}
		})
	},
	SubredditAchievementFlairs: {
		operationName: "GetSubredditAchievementFlairs",
		sha256Hash: "79fd2b41e16051e19210d0fd15c067f47b045a35f107acdd763d255de0836313",
		hardcodedResp: '{"data":{"subredditInfoById":{"__typename":"Subreddit","subredditAchievementFlairs":[]}}}',
		//mapVars: ({ subredditId }) => ({ subredditName: window.store?.getState().subreddits.models[subredditId]?.name ?? 'Littux' })
	},
	SubredditCustomEmojis: {
		operationName: "<hardcoded>",
		hardcodedResp: '{"data":{}}'
	},
	SubredditInfo: {
		operationName: "SubredditInfoByName",
		sha256Hash: "2c4e9fcfd57b11c4ca2e00e087aa243891f7e2e251192ad4a9b7b2a63d4b1b8e",
		mapResp: ({ subredditInfoByName }) => ({
			subreddit: {
				publicDescription: {
					markdown: subredditInfoByName?.publicDescriptionText
				},
				...subredditInfoByName
			}
		})
	},
	SubredditPosts: {
		operationName: "SubredditFeedElements",
		sha256Hash: "97046e2a48050f10a507db354a8da60955ffccb586dcf63163bdfc6610d5cf7a",
	},
	SubredditPage: {
		operationName: "SubredditFeedElements",
		hardcodedResp: '{"data":{"subredditInfoByName":null}}',
		/* sha256Hash: "97046e2a48050f10a507db354a8da60955ffccb586dcf63163bdfc6610d5cf7a",
		mapVars: ({ name, ...rest }) => ({ subredditName: name, includeSubredditInPosts: true, ...rest }),
		mapResp: ({ postFeed }: any) => ({ subredditInfoByName: postFeed }) */
	},
	SubredditRecommendations: {
		operationName: "GetRelatedCommunityRecommendations", // 2026 app
		sha256Hash: "4ee5adcdb9483c0b16d0b83c7ea6fb985ea1e1321f33b408ff844fd1fc72eafd",
	},
	SubredditPostFlairStyleTemplates: {
		operationName: "GetFlairs",
		sha256Hash: "f14c4d85da795fe5912abd822173b451d207d358a66ca6ddaea3404009b63ad3",
	},
	SubredditRules: {
		operationName: "GetRules", // 2026 app
		sha256Hash: "4902196475197c7a61271b7381b0229f42cd698929899be77b878a90e15fa5b8",
		mapVars: ({ subredditName }) => ({ subredditId: subredditNameToId[subredditName.toLowerCase()] }),
		mapResp: ({ subredditInfoById }) => ({ subreddit: subredditInfoById })
	},
	SubredditScheduledPosts: {
		operationName: "ScheduledPostsForSubreddit",
		sha256Hash: "0abbf490ca8eaaa765f6bc048ee654ed895a00f40cd013e9238873fcf89f5647",
	},
	SubredditStyles: {
		operationName: "SubredditStructuredStyle",
		sha256Hash: "fa8cd73c291468ae65be3798ba08cf76f86f7cd3966d95cf71cb522feca10096",
	},
	SubredditsWithAboutInfo: {
		operationName: "SubredditsInfoByNames",
		sha256Hash: "38cf1d7790fdba1ce6918664148bb630456d74cb02c7c42e74e8b44be27e23ba",
	},
	SubredditTypeaheadSearch: {
		operationName: "CommunityPickerSearch",
		sha256Hash: "c70526d35ec6c02115174732b69f992537967b7f5d977d660950f591e2f304b0",
		mapVars: ({ query, includeNsfw }) => ({ query, isNsfwIncluded: includeNsfw })
	},
	SubredditWiki: {
		operationName: "SubredditWiki", // 2026 app
		sha256Hash: "4f446702368bfcd945efe732576160a017ebf73dc24cab7e7d31de91c6bf5dcc",
		mapVars: ({ includePageData, subredditName, wikiPageName }) => ({
			includePage: includePageData,
			subredditName,
			pageName: wikiPageName,
			includeMediaFragment: includePageData,
			includeIsRevisable: includePageData,
			includePageTitle: includePageData,
			includePageContent: includePageData,
			includeRevisionsCount: includePageData
  		}),
		mapResp: ({ subredditInfoByName }) => ({ subreddit: subredditInfoByName })
	},
	SubscribedSubreddits: {
		operationName: "SubscribedSubreddits",
		sha256Hash: "4980ab5fd2422ab0b785ef1ae116d05a823d3900944dd671edc324e5c74ca250",
		mapVars: (vars) => ({ first: 5000, ...vars }),
		mapResp: ({ identity }) => ({
			identity: {
				followedRedditorsInfo: {
					pageInfo: identity.followedRedditorsInfo.pageInfo,
					edges: identity.followedRedditorsInfo.edges.map(({ node: { __typename, profile } }: any) => ({
						node: {
							__typename,
							profile: !profile ? null : {
								...profile,
								styles: {
									...profile.styles,
									legacyIcon: profile.styles.legacyIcon ? {
										url: profile.styles.legacyIcon.url,
										dimensions: {
											width: 256,
											height: 256
										}
									} : null
								}
							}
						}
					}))
				},
				subscribedSubreddits: {
					pageInfo: identity.subscribedSubreddits.pageInfo,
					edges: identity.subscribedSubreddits.edges.map(({ node }: any) => ({
						node: {
							...(addModSubToState(node)),
							styles: {
								...node.styles,
								legacyIcon: node.styles.legacyIcon ? {
									url: node.styles.legacyIcon.url,
									dimensions: {
										width: 256,
										height: 256
									}
								} : null
							}
						}
					}))
				}
			}
		})
	},
	SuggestSubredditGeoPlace: {
		operationName: "SuggestSubredditGeoPlace",
		sha256Hash: "ca6b7abfb79e49887eb3219f903d3551c455a84c889de5b22e01d4f7d5102c10",
	},
	TopicBySlug: {
		operationName: "TopicBySlug",
		sha256Hash: "cf66f5722f3307c7f7f3d824440137ce147f1eed6ffd04218af173604cb357dd",
	},
	TrendingSearches: {
		operationName: "SearchTrendingQueries",
		sha256Hash: "6af8092dc8e4a99808e7fbebd1401a17f2f95f0af8b54964496592473f7f39e5",
		mapVars: (vars) => ({ ...vars, productSurface: "gql" })
	},
	UpdateAccountGender: {
		operationName: "UpdateAccountGender",
		sha256Hash: "7c8ca9f840340b9306d8f82622dcba1931b85b7f1141a4091dc3f1104f67c3dd",
	},
	UpdateAchievementFlairPreference: {
		operationName: "UpdateAchievementFlairPreference",
		sha256Hash: "38f0222f3ed68d776fa36055b471dcf89b427771bd7f66d33520b1d0a191b13a",
	},
	UpdateChatMessagesAsRead: {
		operationName: "UpdateChatMessagesAsRead", // 2026 reddit app
		sha256Hash: "84392e43642c1dcad041888e9c186109cafced2d2f5f51323a87f3ec2ee95ef0",
	},
	UpdateComment: {
		operationName: "UpdateComment",
		sha256Hash: "c43517a749d070bc2d19b123fbdb680de815f4b92c7720ccb9010c2eb0a4a4f8",
	},
	UpdateCommentDistinguishState: {
		operationName: "UpdateCommentDistinguishState",
		sha256Hash: "9f96d8f78f4898bf23e23572d34e64fd4070ed1e9a62e17899d93f815401ddd8",
	},
	UpdateCommentFollowState: {
		operationName: "UpdateCommentFollowState",
		sha256Hash: "a8dfce970c94c91003ab86c2f95e7ebf68f07ef34578ca83eaaa73d8ae7e56de",
	},
	UpdateCommentStickyState: {
		operationName: "ModActionStickyComment",
		sha256Hash: "cd968194e3007f1d6bef97ea18c41765927659783382aaa6c81232c31ca3f44e",
	},
	UpdateCrowdControlFilter: {
		operationName: "UpdateCrowdControlFilter",
		sha256Hash: "1e1104bb153c9e699ee497d2fd3363472ea009dc2f2c7eeac705218b0e1e35fe",
	},
	UpdateCrowdControlLevel: {
		operationName: "UpdatePostCrowdControlLevel",
		sha256Hash: "af49bd07aba8388a4c1e5d4681e269136cbb1119ffe1ea656f4d3c9dda69ef58",
	},
	UpdateHatefulContentFilters: {
		operationName: "UpdateHarassmentFilterContent", // why do they have to rename everything?
		sha256Hash: "5fb8925954535d9f7cabce20787b30f6fa28b63418b92a09337201b8e0ac0a29",
	},
	UpdateInboxActivitySeenState: {
		operationName: "UpdateInboxActivitySeenState",
		sha256Hash: "8a6ec796884e51eedd8c094c322173fe7cceefd33e8e84e48deaaa750bad7772",
		mapVars: () => ({ input: { lastSentAt: (new Date()).toISOString() } })
	},
	UpdateModPnSettingStatus: {
		operationName: "UpdateModPnSettingStatus",
		sha256Hash: "148addfd48dfb7c6580b16192805f51eefd7c3d3cbd316fb5dd6d2e753bcb6be",
	},
	UpdateModPnSettingThreshold: {
		operationName: "UpdateModPnSettingThreshold",
		sha256Hash: "de750fee1e0f912ce9fb55fc4dc2546a930359b5df0cfa4ef7628dda231ba935",
	},
	UpdateNotificationPreferences: {
		operationName: "UpdateNotificationPreferences",
		sha256Hash: "6e3ef4828728567bc9089ef47b531992f57d9d7ff7de10f0c9cfc0c6f294d610",
	},
	UpdatePostDistinguishState: {
		operationName: "UpdatePostDistinguishState",
		sha256Hash: "062755281c05b9619fa925c059582fdefde165cda291ff65291b9fc483c1d311",
	},
	UpdatePostFollowState: {
		operationName: "UpdatePostFollowState",
		sha256Hash: "d3873f18bce9a5c0eb30bee301b610137ef8d5079b81fcf07c895cb625d7c632",
	},
	UpdatePostNsfwState: {
		operationName: "UpdatePostNsfwState",
		sha256Hash: "cac3f3a414d8a03de1b030af74db9bb1fd691ce23dd9934ce9b8e4279a771b6e",
	},
	UpdatePostStickyState: {
		operationName: "ModActionStickyPost",
		sha256Hash: "67e377a62a9012b294c040f0e4b1fbd2712b76430b37e6de7e3c5fb6604bf780",
	},
	UpdateRecommendationPreferences: {
		operationName: "UpdateRecommendationPreferences",
		sha256Hash: "4ed968fd9c5daf9353a8bbdef42d4156b89bc569181866b5e39ebee9b23855af",
	},
	UpdateScheduledPost: {
		operationName: "UpdateScheduledPost",
		sha256Hash: "01b6cb947f369be707bf3f4482ca5b1b7370884ee175a7a3ac2d31db6d174f84",
	},
	UpdateSensitiveAdsPreferences: {
		operationName: "UpdateSensitiveAdsPreferences", // from 2026 reddit app
		sha256Hash: "c936ac09a3779be76a1da69d02a77356538fc42e29d9adec51edf16ea6242e3c",
	},
	UpdateSocialLinks: {
		operationName: "UpdateSocialLinks",
		sha256Hash: "5434179f94bcb7852f24965023f8d5bdd33311d4828755baeb80bee1a95c8507",
	},
	UpdateSpokenLanguagesPreference: {
		operationName: "UpdateSpokenLanguages",
		sha256Hash: "5d87182f99f5d0eabea85b3739e92e6cc412ea378f019bd0b926d1e4131f63f9",
	},
	UpdateSubredditCountrySiteSettings: {
		operationName: "UpdateSubredditCountrySettings",
		sha256Hash: "03912e23bc8259ba2592425f9ae7de21c0f8ece8a883e37391503c8b7be998b5",
	},
	UpdateSubredditMuteSettings: {
		operationName: "UpdateSubredditMuteSettings",
		sha256Hash: "e415f20d6a6f822c26f119aaf2eadad581c74b8469c18afb23e71250a57d9847",
	},
	UpdateSubredditNotificationSettings: {
		operationName: "UpdateSubredditNotificationSettings",
		sha256Hash: "db00c67b5eaf365e47abcaf1774becccc87d2521b4f386d0354ceae019bbe669",
	},
	UpdateSubredditPrimaryTag: {
		operationName: "UpdateSubredditPrimaryTag",
		sha256Hash: "414dcc7fc6bbffca01a3c261541bb044c620052e818db706a62c38ccfbbe2117",
	},
	UpdateSubredditSettings: {
		operationName: "UpdateSubredditSettings",
		sha256Hash: "c601c65ddb7256c45007ae507f951ab70396d046cffb66b8c35f64edf5464bf8",
	},
	UpdateTopicPreferences: {
		operationName: "UpdateTopicPreferences",
		sha256Hash: "5949e7e1f2eaf523bfe1f8d1c8062fc919ae2a7a59e2241b13dd9a3c092c9545",
	},
	UpdateVideoContentPermissionsSetting: {
		operationName: "UpdateVideoContentPermissionSettings",
		sha256Hash: "5108d616acd991f06fe191098476c6b6df8831236b6d6892c30c65dde9047e16",
	},
	UploadV2Events: {
		operationName: "<hardcoded>",
		hardcodedResp: hardcodedMutation('uploadV2Events')
	},
	ValidateCreateSubreddit: {
		operationName: "ValidateCreateSubreddit",
		sha256Hash: "5b8d2bd47f12d5a6534443957409dd09c0629e7a0502c1576b110d8d839cb66d",
	},
	WhereToPostSubRec: {
		operationName: "WhereToPost", // from 2026 app
		sha256Hash: "1a28e4b07e38a2151c8a7981d76509593e1b4b835ddd83565fc4d7bf36ecbdc5",
	},
};
