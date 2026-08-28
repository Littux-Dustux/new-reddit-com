/* eslint-disable */
// @ts-nocheck
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Action: { input: any; output: any; }
  CuratedPost: { input: any; output: any; }
  FilterInputValue: { input: any; output: any; }
  Header: { input: any; output: any; }
  Resource: { input: any; output: any; }
  UNRESOLVED_NAME: { input: string; output: string; }
  UNRESOLVED_NODE: { input: any; output: any; }
  URL: { input: string; output: string; }
  UserFlairSelect: { input: any; output: any; }
};

export type AccountType =
  | 'APP'
  | 'BRAND'
  | 'LITE';

export type ActiveSubredditsInputContext = {
  entryPoint?: InputMaybe<Scalars['String']['input']>;
};

export type AdEventType =
  | 'CLICK'
  | 'COMMENT'
  | 'COMMENTS_VIEW'
  | 'COMMENT_DOWNVOTE'
  | 'COMMENT_UPVOTE'
  | 'DOWNVOTE'
  | 'ENGAGED_CLICK'
  | 'GALLERY_ITEM_IMPRESSION'
  | 'GROUP_M_VIEWABLE'
  | 'IMPRESSION'
  | 'LEAD_GENERATION'
  | 'MRC_VIDEO_VIEWABLE_IMPRESSION'
  | 'PRODUCT_CLICK'
  | 'PRODUCT_IMPRESSION'
  | 'RSVP'
  | 'UNLOAD'
  | 'UPVOTE'
  | 'VENDOR_FULLY_IN_VIEW'
  | 'VENDOR_FULLY_IN_VIEW_5_SECS'
  | 'VENDOR_FULLY_IN_VIEW_15_SECS'
  | 'VIDEO_FULLY_VIEWABLE_IMPRESSION'
  | 'VIDEO_GROUP_M_VIEWABLE'
  | 'VIDEO_PLAYED_EXPANDED'
  | 'VIDEO_PLAYED_WITH_SOUND'
  | 'VIDEO_STARTED'
  | 'VIDEO_VENDOR_FULLY_VIEWABLE_50'
  | 'VIDEO_VIEWABLE_IMPRESSION'
  | 'VIDEO_VIEWABLE_WATCHED_6_SECS'
  | 'VIDEO_VIEWABLE_WATCHED_15_SECS'
  | 'VIDEO_WATCHED_3_SECS'
  | 'VIDEO_WATCHED_5_SECS'
  | 'VIDEO_WATCHED_10_SECS'
  | 'VIDEO_WATCHED_25'
  | 'VIDEO_WATCHED_50'
  | 'VIDEO_WATCHED_75'
  | 'VIDEO_WATCHED_95'
  | 'VIDEO_WATCHED_100'
  | 'VIEWABLE_IMPRESSION';

export type AdWhitelistStatus =
  | 'ALL_ADS'
  | 'HOUSE_ONLY'
  | 'NO_ADS'
  | 'PROMO_ADULT'
  | 'PROMO_ADULT_NSFW'
  | 'PROMO_ALL'
  | 'PROMO_SPECIFIED'
  | 'SOME_ADS';

export type AddressType =
  | 'DOMAIN'
  | 'URL';

export type AutomationActionInput = {
  blockAction?: InputMaybe<AutomationBlockActionInput>;
  informAction?: InputMaybe<AutomationReportActionInput>;
  reportAction?: InputMaybe<AutomationReportActionInput>;
};

export type AutomationAddressConditionInput = {
  addressType: AddressType;
  features: Array<AutomationStringFeature>;
  values: Array<Scalars['String']['input']>;
};

export type AutomationBlockActionInput = {
  message: Scalars['String']['input'];
};

export type AutomationBooleanConditionInput = {
  feature: AutomationBooleanFeature;
  value: Scalars['Boolean']['input'];
};

export type AutomationBooleanFeature =
  | 'HAS_USER_FLAIR';

export type AutomationCommentLevel =
  | 'ALL'
  | 'TOP_COMMENTS_ONLY';

export type AutomationCommentPrerequisitesInput = {
  commentLevel: AutomationCommentLevel;
};

export type AutomationCompositeConditionInput = {
  children: Array<CompositeChildConditionInput>;
  operator: CompositeConditionType;
};

export type AutomationConditionInput = {
  addressCondition?: InputMaybe<AutomationAddressConditionInput>;
  booleanCondition?: InputMaybe<AutomationBooleanConditionInput>;
  compositeCondition?: InputMaybe<AutomationCompositeConditionInput>;
  notCondition?: InputMaybe<AutomationNotConditionInput>;
  regexCondition?: InputMaybe<AutomationRegexConditionInput>;
  stringCondition?: InputMaybe<AutomationStringConditionInput>;
  stringExactMatchCondition?: InputMaybe<AutomationStringExactMatchConditionInput>;
};

export type AutomationInformActionInput = {
  message: Scalars['String']['input'];
};

export type AutomationNotConditionInput = {
  addressCondition?: InputMaybe<AutomationAddressConditionInput>;
  regexCondition?: InputMaybe<AutomationRegexConditionInput>;
  stringCondition?: InputMaybe<AutomationStringConditionInput>;
  stringExactMatchCondition?: InputMaybe<AutomationStringExactMatchConditionInput>;
};

export type AutomationPostPrerequisitesInput = {
  postTypes: Array<PostType>;
};

export type AutomationPrerequisitesInput = {
  commentPrerequisites?: InputMaybe<AutomationCommentPrerequisitesInput>;
  postPrerequisites?: InputMaybe<AutomationPostPrerequisitesInput>;
};

export type AutomationRegexConditionInput = {
  features: Array<AutomationStringFeature>;
  isCaseSensitive: Scalars['Boolean']['input'];
  value: Scalars['String']['input'];
};

export type AutomationReportActionInput = {
  message: Scalars['String']['input'];
};

export type AutomationStatus =
  | 'DISABLED'
  | 'ENABLED';

export type AutomationStringConditionInput = {
  features: Array<AutomationStringFeature>;
  values: Array<Scalars['String']['input']>;
};

export type AutomationStringExactMatchConditionInput = {
  feature: AutomationStringFeature;
  values: Array<Scalars['String']['input']>;
};

export type AutomationStringFeature =
  | 'COMMENT_BODY'
  | 'POST_BODY'
  | 'POST_FLAIR'
  | 'POST_FLAIR_TEMPLATE_ID'
  | 'POST_TITLE'
  | 'POST_TYPE'
  | 'POST_URL'
  | 'USER_FLAIR'
  | 'USER_FLAIR_TEMPLATE_ID';

export type AutomationTrigger =
  | 'COMMENT'
  | 'POST';

export type BanEvasionConfidence =
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type CellMediaType =
  | 'IMAGE'
  | 'VIDEO';

export type CellVideoType =
  | 'DASH'
  | 'HLS'
  | 'MP4'
  | 'STREAMABLE';

export type CommentCollapsedReason =
  | 'ADMIN_TAKEDOWN'
  | 'BLOCKED_AUTHOR'
  | 'CROWD_CONTROL'
  | 'DELETED'
  | 'LOW_SCORE'
  | 'MOD_REMOVED'
  | 'POTENTIALLY_TOXIC'
  | 'SPAMMY'
  | 'STICKY_AUTOMOD'
  | 'UNKNOWN';

export type CommentFollowedStatus =
  | 'FOLLOWING'
  | 'NOT_FOLLOWING'
  | 'UNKNOWN';

export type CommentMediaType =
  | 'ANIMATED'
  | 'EXPRESSION'
  | 'GIPHY'
  | 'STATIC'
  | 'VIDEO';

export type CommentRange =
  | 'ALL'
  | 'DAY'
  | 'HOUR'
  | 'MONTH'
  | 'WEEK'
  | 'YEAR';

export type CommentSort =
  | 'BLANK'
  | 'CONFIDENCE'
  | 'CONTROVERSIAL'
  | 'LIVE'
  | 'NEW'
  | 'OLD'
  | 'QA'
  | 'RANDOM'
  | 'TOP';

export type CommentTreeFilter =
  | 'ANSWERED'
  | 'UNANSWERED';

export type CommunityPostType =
  | 'IMAGE'
  | 'TEXT'
  | 'VIDEO';

export type CompositeChildConditionInput = {
  addressCondition?: InputMaybe<AutomationAddressConditionInput>;
  booleanCondition?: InputMaybe<AutomationBooleanConditionInput>;
  notCondition?: InputMaybe<AutomationNotConditionInput>;
  regexCondition?: InputMaybe<AutomationRegexConditionInput>;
  stringCondition?: InputMaybe<AutomationStringConditionInput>;
  stringExactMatchCondition?: InputMaybe<AutomationStringExactMatchConditionInput>;
};

export type CompositeConditionType =
  | 'AND';

export type ContentType =
  | 'RTJSON'
  | 'TEXT';

export type ContributorTier =
  | 'CONTRIBUTOR'
  | 'NON_CONTRIBUTOR'
  | 'TOP_CONTRIBUTOR';

export type CreateAutomationInput = {
  actions: Array<AutomationActionInput>;
  condition: AutomationConditionInput;
  name: Scalars['String']['input'];
  prerequisites?: InputMaybe<AutomationPrerequisitesInput>;
  subredditId: Scalars['ID']['input'];
  trigger: AutomationTrigger;
};

export type CrowdControlLevel =
  | 'LENIENT'
  | 'MEDIUM'
  | 'OFF'
  | 'STRICT';

export type DevvitAppPromotionStatus =
  | 'NONE'
  | 'REDDIT_PROMOTED';

export type DevvitAppVisibility =
  | 'PRIVATE'
  | 'PUBLIC'
  | 'UNLISTED';

export type DistinguishedAs =
  | 'ADMIN'
  | 'GOLD'
  | 'GOLD_AUTO'
  | 'MODERATOR'
  | 'SPECIAL';

export type EconPromoType =
  | 'EDUCATIONAL_BANNER'
  | 'EDUCATIONAL_MODULE'
  | 'TOOLTIP'
  | 'UNKNOWN';

export type FilterInput = {
  key: Scalars['String']['input'];
  value: Scalars['FilterInputValue']['input'];
};

export type FlairType =
  | 'AUTHOR'
  | 'POST';

export type FocusedCommentContext = {
  commentId?: InputMaybe<Scalars['ID']['input']>;
};

export type MediaAssetStatus =
  | 'FAILED'
  | 'INVALID'
  | 'UNPROCESSED'
  | 'VALID';

export type MimeType =
  | 'GIF'
  | 'JPEG'
  | 'MP4'
  | 'PNG'
  | 'QUICKTIME'
  | 'WEBP';

export type ModActionCategory =
  | 'APPS'
  | 'AWARDS'
  | 'CHAT'
  | 'COMMENTS'
  | 'CROWD_CONTROL'
  | 'MEMBERS'
  | 'MOD_TEAM'
  | 'POSTS'
  | 'POSTS_AND_COMMENTS'
  | 'RULES'
  | 'SETTINGS'
  | 'WIKI';

export type ModActionType =
  | 'ACCEPT_MODERATOR_INVITE'
  | 'ADD_COMMUNITY_TOPICS'
  | 'ADD_CONTRIBUTOR'
  | 'ADD_MODERATOR'
  | 'ADD_NOTE'
  | 'ADD_REMOVAL_REASON'
  | 'ADJUST_POST_CROWD_CONTROL_LEVEL'
  | 'APPROVE_AWARD'
  | 'APPROVE_COMMENT'
  | 'APPROVE_LINK'
  | 'BAN_USER'
  | 'CHAT_APPROVE_MESSAGE'
  | 'CHAT_BAN_USER'
  | 'CHAT_INVITE_HOST'
  | 'CHAT_REMOVE_HOST'
  | 'CHAT_REMOVE_MESSAGE'
  | 'CHAT_UNBAN_USER'
  | 'COLLECTIONS'
  | 'COMMUNITY_STATUS'
  | 'COMMUNITY_STYLING'
  | 'COMMUNITY_WELCOME_PAGE'
  | 'COMMUNITY_WIDGETS'
  | 'CREATE_AWARD'
  | 'CREATE_REMOVAL_REASON'
  | 'CREATE_RULE'
  | 'CREATE_SCHEDULED_POST'
  | 'DELETE_AWARD'
  | 'DELETE_NOTE'
  | 'DELETE_OVERRIDDEN_CLASSIFICATION'
  | 'DELETE_REMOVAL_REASON'
  | 'DELETE_RULE'
  | 'DELETE_SCHEDULED_POST'
  | 'DEV_PLATFORM_APP_CHANGED'
  | 'DEV_PLATFORM_APP_DISABLED'
  | 'DEV_PLATFORM_APP_ENABLED'
  | 'DEV_PLATFORM_APP_INSTALLED'
  | 'DEV_PLATFORM_APP_UNINSTALLED'
  | 'DISABLE_AWARD'
  | 'DISABLE_POST_CROWD_CONTROL_FILTER'
  | 'DISTINGUISH'
  | 'EDIT_COMMENT_REQUIREMENTS'
  | 'EDIT_FLAIR'
  | 'EDIT_POST_REQUIREMENTS'
  | 'EDIT_RULE'
  | 'EDIT_SAVED_RESPONSE'
  | 'EDIT_SCHEDULED_POST'
  | 'EDIT_SETTINGS'
  | 'ENABLE_AWARD'
  | 'ENABLE_POST_CROWD_CONTROL_FILTER'
  | 'EVENTS'
  | 'HIDDEN_AWARD'
  | 'IGNORE_REPORTS'
  | 'INVITE_MODERATOR'
  | 'INVITE_SUBSCRIBER'
  | 'LOCK'
  | 'MARK_NSFW'
  | 'MARK_ORIGINAL_CONTENT'
  | 'MODMAIL_ENROLLMENT'
  | 'MOD_AWARD_GIVEN'
  | 'MOD_RECRUITMENT_APPLICATION_REMOVE'
  | 'MOD_RECRUITMENT_APPLICATION_RESPOND'
  | 'MOD_RECRUITMENT_DISABLE'
  | 'MOD_RECRUITMENT_ENABLE'
  | 'MOD_RECRUITMENT_UPDATE_TEMPLATE'
  | 'MUTE_USER'
  | 'OVERRIDE_CLASSIFICATION'
  | 'REMOVE_COMMENT'
  | 'REMOVE_COMMUNITY_TOPICS'
  | 'REMOVE_CONTRIBUTOR'
  | 'REMOVE_LINK'
  | 'REMOVE_MODERATOR'
  | 'REMOVE_WIKI_CONTRIBUTOR'
  | 'REORDER_MODERATORS'
  | 'REORDER_REMOVAL_REASON'
  | 'REORDER_RULES'
  | 'REQUEST_ASSISTANCE'
  | 'SET_CONTEST_MODE'
  | 'SET_PERMISSIONS'
  | 'SET_SUGGESTEDSORT'
  | 'SHOW_COMMENT'
  | 'SNOOZE_REPORTS'
  | 'SPAM_COMMENT'
  | 'SPAM_LINK'
  | 'SPOILER'
  | 'STICKY'
  | 'SUBMIT_CONTENT_RATING_SURVEY'
  | 'SUBMIT_SCHEDULED_POST'
  | 'UNBAN_USER'
  | 'UNIGNORE_REPORTS'
  | 'UNINVITE_MODERATOR'
  | 'UNLOCK'
  | 'UNMUTE_USER'
  | 'UNSET_CONTEST_MODE'
  | 'UNSNOOZE_REPORTS'
  | 'UNSPOILER'
  | 'UNSTICKY'
  | 'UPDATE_REMOVAL_REASON'
  | 'WIKI_BANNED'
  | 'WIKI_CONTRIBUTOR'
  | 'WIKI_PAGE_LISTED'
  | 'WIKI_PERM_LEVEL'
  | 'WIKI_REVISE'
  | 'WIKI_UNBANNED';

export type ModQueueItemType =
  | 'AWARD'
  | 'CHAT_COMMENT'
  | 'COMMENT'
  | 'MATRIX_CHAT_EVENT'
  | 'POST';

export type ModQueueReasonConfidenceLevel =
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type ModQueueReasonIcon =
  | 'AUTOMOD'
  | 'BAN'
  | 'CROWD_CONTROL'
  | 'MOD_MODE'
  | 'MOD_QUEUE'
  | 'RATINGS_MATURE'
  | 'REPORT'
  | 'SPAM'
  | 'WARNING';

export type ModQueueSort =
  | 'SORT_DATE'
  | 'SORT_DATE_REVERSE'
  | 'SORT_REPORTS'
  | 'SORT_REPORTS_REVERSE';

export type ModQueueTriggerType =
  | 'ADMIN'
  | 'AUTOMOD'
  | 'AUTOMOD_REPORT'
  | 'BAN_EVASION'
  | 'COMMENT_GUIDANCE'
  | 'CROWD_CONTROL'
  | 'DOMAIN_BAN'
  | 'HATEFUL_CONTENT'
  | 'MOD'
  | 'POST_GUIDANCE'
  | 'REPUTATION'
  | 'SEXUAL_CONTENT'
  | 'SHADOWBANNED_SUBMITTER'
  | 'SPAM_FILTER'
  | 'USER_REPORTS'
  | 'VIOLENT_CONTENT';

export type ModQueueType =
  | 'COMMUNITY_CHAT'
  | 'EDITED'
  | 'HIDDEN_REPORTED'
  | 'MOD'
  | 'REMOVED'
  | 'REPORTED'
  | 'UNMODERATED';

export type ModUserNoteLabel =
  | 'ABUSE_WARNING'
  | 'BAN'
  | 'BOT_BAN'
  | 'HELPFUL_USER'
  | 'PERMA_BAN'
  | 'SOLID_CONTRIBUTOR'
  | 'SPAM_WARNING'
  | 'SPAM_WATCH'
  | 'USER_SUMMARY';

export type ModerationVerdict =
  | 'ADMIN_APPROVED'
  | 'ADMIN_REMOVED'
  | 'ADMIN_SPAMMED'
  | 'MOD_APPROVED'
  | 'MOD_REMOVED'
  | 'MOD_SPAMMED';

export type ModerationVerdictReason =
  | 'LEGAL';

export type PostEventType =
  | 'AD_REMINDER'
  | 'AMA'
  | 'AMA_LITE'
  | 'CONVERTED_AMA'
  | 'UNKNOWN';

export type PostHintValue =
  | 'GALLERY'
  | 'HOSTED_VIDEO'
  | 'IMAGE'
  | 'LINK'
  | 'POLL'
  | 'RICH_VIDEO'
  | 'SELF'
  | 'VIDEO';

export type PostType =
  | 'CROSSPOST'
  | 'GALLERY'
  | 'IMAGE'
  | 'LINK'
  | 'POLL'
  | 'PREDICTION'
  | 'SPOILER'
  | 'STREAMING'
  | 'TALK'
  | 'TEXT'
  | 'VIDEO'
  | 'VIDEOGIF';

export type PreviousActionType =
  | 'AUTOMOD_REPORT'
  | 'COMMENT_GUIDANCE'
  | 'MOD_ACTION'
  | 'MOD_REPORT'
  | 'POST_GUIDANCE'
  | 'REPORT'
  | 'USER_REPORT';

export type ProfileFeedSort =
  | 'CONTROVERSIAL'
  | 'HOT'
  | 'NEW'
  | 'TOP';

export type RedditorType =
  | 'BUSINESS'
  | 'USER';

export type RemovedByCategory =
  | 'ANTI_EVIL_OPS'
  | 'AUTHOR'
  | 'AUTOMOD_FILTERED'
  | 'COMMUNITY_OPS'
  | 'CONTENT_TAKEDOWN'
  | 'COPYRIGHT_TAKEDOWN'
  | 'DELETED'
  | 'MODERATOR'
  | 'REDDIT';

export type SavedResponseContext =
  | 'BANS'
  | 'CHAT'
  | 'COMMENTS'
  | 'GENERAL'
  | 'MODMAIL'
  | 'REMOVALS'
  | 'REPORTS'
  | 'SITEWIDE_BANS'
  | 'SITEWIDE_REMOVALS';

export type SearchContext = {
  ad?: InputMaybe<Scalars['String']['input']>;
  correlationId?: InputMaybe<Scalars['ID']['input']>;
  isClientPrefNsfw?: InputMaybe<Scalars['Boolean']['input']>;
  modifiersVersion?: InputMaybe<Scalars['String']['input']>;
  originPageType?: InputMaybe<Scalars['String']['input']>;
  pane?: InputMaybe<Scalars['String']['input']>;
  queryId?: InputMaybe<Scalars['ID']['input']>;
  structureType?: InputMaybe<Scalars['String']['input']>;
};

export type SearchPostSort =
  | 'COMMENTS'
  | 'HOT'
  | 'NEW'
  | 'RELEVANCE'
  | 'TOP';

export type SearchQueryModifierInput = {
  includeSnippet?: InputMaybe<Scalars['Boolean']['input']>;
  includeSpellcheck?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SocialLinkType =
  | 'BEACONS'
  | 'BUY_ME_A_COFFEE'
  | 'CAMEO'
  | 'CASH_APP'
  | 'CUSTOM'
  | 'DISCORD'
  | 'FACEBOOK'
  | 'INDIEGOGO'
  | 'INSTAGRAM'
  | 'KICKSTARTER'
  | 'KOFI'
  | 'LINKTREE'
  | 'ONLYFANS'
  | 'PATREON'
  | 'PAYPAL'
  | 'REDDIT'
  | 'SHOPIFY'
  | 'SOUNDCLOUD'
  | 'SPOTIFY'
  | 'SUBSTACK'
  | 'TIKTOK'
  | 'TUMBLR'
  | 'TWITCH'
  | 'TWITTER'
  | 'VENMO'
  | 'YOUTUBE';

export type SubredditAllowedPostType =
  | 'ANY'
  | 'LINK'
  | 'SELF';

export type SubredditForbiddenReason =
  | 'BANNED'
  | 'GATED'
  | 'GOLD_ONLY'
  | 'PRIVATE'
  | 'QUARANTINED'
  | 'UNAVAILABLE_AGE'
  | 'UNAVAILABLE_UNVERIFIED_AGE'
  | 'UNDERAGE'
  | 'UNDER_VERIFIED_AGE'
  | 'UNKNOWN'
  | 'UNVERIFIED_AGE';

export type SubredditNotificationLevel =
  | 'ALL'
  | 'FREQUENT'
  | 'LOW'
  | 'OFF';

export type SubredditRuleKind =
  | 'COMMENT'
  | 'LINK'
  | 'LINK_AND_COMMENT';

export type SubredditType =
  | 'ARCHIVED'
  | 'EMPLOYEES_ONLY'
  | 'GOLD_ONLY'
  | 'GOLD_RESTRICTED'
  | 'PRIVATE'
  | 'PUBLIC'
  | 'RESTRICTED'
  | 'USER';

export type SubredditWikiPageStatus =
  | 'MAY_NOT_VIEW'
  | 'PAGE_NOT_CREATED'
  | 'PAGE_NOT_FOUND'
  | 'RESTRICTED_PAGE'
  | 'UNKNOWN'
  | 'VALID'
  | 'WIKI_DISABLED';

export type TranscodingStatus =
  | 'COMPLETED'
  | 'ERROR'
  | 'INCOMPLETE';

export type UnavailableProfileReason =
  | 'LEGAL_REQUEST'
  | 'UNAVAILABLE_AGE'
  | 'UNAVAILABLE_UNVERIFIED_AGE'
  | 'UNDERAGE'
  | 'UNDER_VERIFIED_AGE'
  | 'UNKNOWN'
  | 'UNVERIFIED_AGE'
  | 'VIEWER_BLOCKED';

export type UxTargetingExperience =
  | 'AMA_CAROUSEL_IN_FEED'
  | 'ANNOUNCEMENT_IN_FEED'
  | 'ARENA_FEED'
  | 'AUTH'
  | 'AUTH_PROMPT'
  | 'AWARDER_CHURNED'
  | 'AWARDER_DORMANT'
  | 'AWARDER_FIRST_TIME'
  | 'AWARDER_NEVER_AWARDED'
  | 'AWARDER_RECURRING'
  | 'AWARDS_PROMO'
  | 'BLOCKING_XPROMO'
  | 'BYPASSABLE_XPROMO'
  | 'CHAT_CHANNELS_ON_PDP'
  | 'CHAT_CHANNEL_UNIT_IN_HOME_FEED'
  | 'CHAT_ONBOARDING_CTA'
  | 'COMMUNITY_ONBOARDING'
  | 'DESKTOP_SIDEBAR_AUTH_UNIT'
  | 'EDUCATIONAL_DEEPLINK_PROMPT'
  | 'EVEREST_PROMO'
  | 'EXCLUSIVE_COMMUNITIES_GROWTH_TEST'
  | 'EXCLUSIVE_COMMUNITIES_VALIDATION_TEST'
  | 'GAMING_COMMUNITY_UPSELL'
  | 'GOOGLE_ONE_TAP'
  | 'HIGH_FLYER_UPSELL'
  | 'INLINE_AUTH_UPSELL'
  | 'IN_FEED_SURVEY'
  | 'LANGUAGE_PREFERENCE_BOTTOM_SHEET'
  | 'LISTING_BELOW'
  | 'LIVE_CHAT_REACTION_EDU'
  | 'LIVE_CHAT_VIDEO_EDU'
  | 'LOGGED_IN_ONBOARDING'
  | 'MODULAR_EDUCATION'
  | 'MOD_RECRUITMENT_BANNER'
  | 'NEW_IN_YOUR_COMMUNITIES_CAROUSEL'
  | 'NEW_USER_EDUCATION'
  | 'NEW_VISITOR_FEED_NAV'
  | 'NSFW_BLOCKING'
  | 'ONBOARDING_AGE_SELECTION'
  | 'ONBOARDING_EMAIL_CONFIRMATION'
  | 'ONBOARDING_FLOW_COMPLETION'
  | 'ONBOARDING_GENDER_SELECTION'
  | 'ONBOARDING_IN_FEED'
  | 'ONBOARDING_LANGUAGE_SELECTION'
  | 'ONBOARDING_TOPICS_SELECTION'
  | 'PERSISTENT_QR_CODE_UNIT'
  | 'PERSONALIZED_COMMUNITY_RECOMMENDATIONS_IN_DISCOVER_FEED'
  | 'PERSONALIZED_COMMUNITY_RECOMMENDATIONS_IN_HOME_FEED'
  | 'PWA_XPROMO'
  | 'RECOMMENDATION_CHAINING_IN_HOME_FEED'
  | 'REDDIT_PRO_PROFILE_CARD'
  | 'REDDIT_PRO_PROFILE_PIN_POST_COACHMARK'
  | 'REDDIT_PRO_PROMO'
  | 'REDDIT_PRO_SHARE_BUTTON_COACHMARK'
  | 'REONBOARDING_BOTTOM_SHEET'
  | 'REONBOARDING_BOTTOM_SHEET_IN_PLACE'
  | 'REONBOARDING_IN_FEED'
  | 'SCREENSHOT_SHARING_BANNER'
  | 'STRING_ID_EXPERIENCE'
  | 'SUBREDDIT_RECOMMENDATIONS_IN_SUBREDDIT_FEED'
  | 'VIRAL_COMMUNITY_XPROMO'
  | 'WIKI_PILOT_COMMUNITIES'
  | 'WIKI_SUBREDDIT_FEED_CAROUSEL';

export type VerificationStatus =
  | 'NONE'
  | 'PROFILE_VERIFIED';

export type VoteState =
  | 'DOWN'
  | 'NONE'
  | 'UP';

export type WikiEditMode =
  | 'ANYONE'
  | 'DISABLED'
  | 'MODONLY';

export type PostCommentsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  sortType?: InputMaybe<CommentSort>;
  after?: InputMaybe<Scalars['String']['input']>;
  maxDepth?: InputMaybe<Scalars['Int']['input']>;
  count?: InputMaybe<Scalars['Int']['input']>;
  includeAwards?: InputMaybe<Scalars['Boolean']['input']>;
  includeCommentsHtmlField?: InputMaybe<Scalars['Boolean']['input']>;
  truncate?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<CommentTreeFilter>;
  includeIsGildable?: InputMaybe<Scalars['Boolean']['input']>;
  includeMediaAuth?: InputMaybe<Scalars['Boolean']['input']>;
  includeAdEligibility?: InputMaybe<Scalars['Boolean']['input']>;
  isUserMod?: InputMaybe<Scalars['Boolean']['input']>;
  includeExtendedVideoAsset?: InputMaybe<Scalars['Boolean']['input']>;
  includePageInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeVideoPlaybackInComments?: InputMaybe<Scalars['Boolean']['input']>;
  includeCommentViewStats?: InputMaybe<Scalars['Boolean']['input']>;
  focusedCommentContext?: InputMaybe<FocusedCommentContext>;
  numParents?: InputMaybe<Scalars['Int']['input']>;
  includePremiumAvatarTreatment: Scalars['Boolean']['input'];
  includeModContentDiscussions?: InputMaybe<Scalars['Boolean']['input']>;
  includeCommentFollowedForNotificationsStatus?: InputMaybe<Scalars['Boolean']['input']>;
  includeRedditHandleInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeVerificationStatus?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type PostCommentsQuery = { postInfoById?:
    | { __typename: 'DeletedSubredditPost', commentCount: number, id: string, title: string, commentForest: { __typename: 'CommentForest', pageInfo?: { __typename?: 'PageInfo', commentCount?: number | null, hasNextPage?: boolean | null }, trees: Array<{ __typename?: 'CommentTree', depth: number, parentId: string, childCount: number, more?: { __typename?: 'More', count: number, cursor: string, isTooDeepForCount: boolean } | null, node?:
            | { __typename: 'Comment', id: string, createdAt: string, editedAt: number, isAdminTakedown: boolean, isRemoved: boolean, removedByCategory: RemovedByCategory, isLocked: boolean, isGildable?: boolean, isInitiallyCollapsed: boolean, initiallyCollapsedReason: CommentCollapsedReason, isTranslatable: boolean, languageCode: string, score: number, voteState: VoteState, isSaved: boolean, followedForNotificationsStatus?: CommentFollowedStatus, isStickied: boolean, isScoreHidden: boolean, isArchived: boolean, distinguishedAs: boolean, permalink: string, isCommercialCommunication: boolean, content: { __typename: 'Content', markdown: string, html?: string, preview: string, richtext: string, typeHint: ContentType, translationInfo: { __typename?: 'TranslationInfo', isTranslated: boolean, translatedLanguage: string }, richtextMedia:
                  | { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                  | { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                  | { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } }
                 }, authorInfo:
                | { __typename: 'DeletedRedditor', name: string, id: string }
                | { __typename: 'Redditor', isPremiumAvatarTreatment: boolean, name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean }, attributes?: { __typename?: 'RedditorAttributes', redditorType?: RedditorType, verificationStatus?: VerificationStatus, redditHandleInfo?: { __typename?: 'RedditHandleInfo', displayName: string, prefixedUsername: string, username: string } } | null }
                | { __typename: 'UnavailableRedditor', name: string, id: string }
              , authorCommunityBadge?: { __typename: 'AchievementBadge', label: string, accessibilityLabel: string, image: { __typename?: 'MediaSource', url?: string | null } } | null, authorFlair: { __typename: 'AuthorFlair', text: string, richtext: string, textColor: string, template: { __typename?: 'FlairTemplate', id: string, backgroundColor: string } }, awardings?: { __typename: 'AwardingTotal', total: number, awardingByCurrentUser: { __typename?: 'Award', id: string }, award: { __typename: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } } }, moderationInfo: { __typename: 'CommentModerationInfo', isAutoCollapsedFromCrowdControl: boolean, verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, isRemoved: boolean, proxyAuthor:
                  | { __typename?: 'DeletedRedditor', id: string, displayName: string }
                  | { __typename?: 'Redditor', id: string, displayName: string }
                  | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
                , verdictByRedditorInfo:
                  | { __typename: 'DeletedRedditor', id: string, name: string }
                  | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                  | { __typename: 'UnavailableRedditor', id: string, name: string }
                , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
                    | { __typename: 'DeletedRedditor', id: string, name: string }
                    | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                    | { __typename: 'UnavailableRedditor', id: string, name: string }
                   }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
                  | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
                  | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                  | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
                      | { __typename: 'DeletedRedditor', id: string, displayName: string }
                      | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                      | { __typename: 'UnavailableRedditor', id: string, displayName: string }
                     }
                  | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                  | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                > | null, lastAuthorModNote?:
                  | { __typename: 'ModUserNote', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
                 | null }, commentStats?: { __typename?: 'CommentStats', viewCountTotals?: { __typename?: 'ViewCountTotals', totalCount?: number | null } | null }, modContentDiscussion?: { __typename: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
                  | { __typename?: 'DeletedRedditor', id: string, displayName: string }
                  | { __typename?: 'Redditor', id: string, displayName: string }
                  | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
                 } | null }
            | { __typename: 'DeletedComment', isInitiallyCollapsed: boolean, createdAt: string, removedByCategory: RemovedByCategory, moderationInfo: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, verdictByRedditorInfo:
                  | { __typename: 'DeletedRedditor', id: string, name: string }
                  | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                  | { __typename: 'UnavailableRedditor', id: string, name: string }
                , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
                    | { __typename: 'DeletedRedditor', id: string, name: string }
                    | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                    | { __typename: 'UnavailableRedditor', id: string, name: string }
                   }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, lastAuthorModNote?:
                  | { __typename: 'ModUserNote', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
                 | null } }
           | null }> }, moderationInfo?: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, verdictReason?: string | null, banReason: string, reportCount: number, isReportingIgnored: boolean, isRemoved: boolean, verdictByRedditorInfo:
          | { __typename: 'DeletedRedditor', name: string, id: string }
          | { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } }
          | { __typename: 'UnavailableRedditor', name: string, id: string }
        , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
            | { __typename: 'DeletedRedditor', id: string, name: string }
            | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
            | { __typename: 'UnavailableRedditor', id: string, name: string }
           }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
          | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
          | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
              | { __typename: 'DeletedRedditor', id: string, displayName: string }
              | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
              | { __typename: 'UnavailableRedditor', id: string, displayName: string }
             }
          | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
        > | null, lastAuthorModNote?:
          | { __typename: 'ModUserNote', label: ModUserNoteLabel }
          | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
          | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
         | null } | null }
    | { __typename: 'ProfilePost', commentCount: number, id: string, title: string, commentForest: { __typename: 'CommentForest', pageInfo?: { __typename?: 'PageInfo', commentCount?: number | null, hasNextPage?: boolean | null }, trees: Array<{ __typename?: 'CommentTree', depth: number, parentId: string, childCount: number, more?: { __typename?: 'More', count: number, cursor: string, isTooDeepForCount: boolean } | null, node?:
            | { __typename: 'Comment', id: string, createdAt: string, editedAt: number, isAdminTakedown: boolean, isRemoved: boolean, removedByCategory: RemovedByCategory, isLocked: boolean, isGildable?: boolean, isInitiallyCollapsed: boolean, initiallyCollapsedReason: CommentCollapsedReason, isTranslatable: boolean, languageCode: string, score: number, voteState: VoteState, isSaved: boolean, followedForNotificationsStatus?: CommentFollowedStatus, isStickied: boolean, isScoreHidden: boolean, isArchived: boolean, distinguishedAs: boolean, permalink: string, isCommercialCommunication: boolean, content: { __typename: 'Content', markdown: string, html?: string, preview: string, richtext: string, typeHint: ContentType, translationInfo: { __typename?: 'TranslationInfo', isTranslated: boolean, translatedLanguage: string }, richtextMedia:
                  | { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                  | { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                  | { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } }
                 }, authorInfo:
                | { __typename: 'DeletedRedditor', name: string, id: string }
                | { __typename: 'Redditor', isPremiumAvatarTreatment: boolean, name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean }, attributes?: { __typename?: 'RedditorAttributes', redditorType?: RedditorType, verificationStatus?: VerificationStatus, redditHandleInfo?: { __typename?: 'RedditHandleInfo', displayName: string, prefixedUsername: string, username: string } } | null }
                | { __typename: 'UnavailableRedditor', name: string, id: string }
              , authorCommunityBadge?: { __typename: 'AchievementBadge', label: string, accessibilityLabel: string, image: { __typename?: 'MediaSource', url?: string | null } } | null, authorFlair: { __typename: 'AuthorFlair', text: string, richtext: string, textColor: string, template: { __typename?: 'FlairTemplate', id: string, backgroundColor: string } }, awardings?: { __typename: 'AwardingTotal', total: number, awardingByCurrentUser: { __typename?: 'Award', id: string }, award: { __typename: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } } }, moderationInfo: { __typename: 'CommentModerationInfo', isAutoCollapsedFromCrowdControl: boolean, verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, isRemoved: boolean, proxyAuthor:
                  | { __typename?: 'DeletedRedditor', id: string, displayName: string }
                  | { __typename?: 'Redditor', id: string, displayName: string }
                  | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
                , verdictByRedditorInfo:
                  | { __typename: 'DeletedRedditor', id: string, name: string }
                  | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                  | { __typename: 'UnavailableRedditor', id: string, name: string }
                , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
                    | { __typename: 'DeletedRedditor', id: string, name: string }
                    | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                    | { __typename: 'UnavailableRedditor', id: string, name: string }
                   }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
                  | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
                  | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                  | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
                      | { __typename: 'DeletedRedditor', id: string, displayName: string }
                      | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                      | { __typename: 'UnavailableRedditor', id: string, displayName: string }
                     }
                  | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                  | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                > | null, lastAuthorModNote?:
                  | { __typename: 'ModUserNote', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
                 | null }, commentStats?: { __typename?: 'CommentStats', viewCountTotals?: { __typename?: 'ViewCountTotals', totalCount?: number | null } | null }, modContentDiscussion?: { __typename: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
                  | { __typename?: 'DeletedRedditor', id: string, displayName: string }
                  | { __typename?: 'Redditor', id: string, displayName: string }
                  | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
                 } | null }
            | { __typename: 'DeletedComment', isInitiallyCollapsed: boolean, createdAt: string, removedByCategory: RemovedByCategory, moderationInfo: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, verdictByRedditorInfo:
                  | { __typename: 'DeletedRedditor', id: string, name: string }
                  | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                  | { __typename: 'UnavailableRedditor', id: string, name: string }
                , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
                    | { __typename: 'DeletedRedditor', id: string, name: string }
                    | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                    | { __typename: 'UnavailableRedditor', id: string, name: string }
                   }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, lastAuthorModNote?:
                  | { __typename: 'ModUserNote', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
                 | null } }
           | null }> }, profile: { __typename?: 'Profile', redditorInfo:
          | { __typename: 'DeletedRedditor', id: string, name: string }
          | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
          | { __typename: 'UnavailableRedditor', id: string, name: string }
         }, moderationInfo?: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, verdictReason?: string | null, banReason: string, reportCount: number, isReportingIgnored: boolean, isRemoved: boolean, verdictByRedditorInfo:
          | { __typename: 'DeletedRedditor', name: string, id: string }
          | { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } }
          | { __typename: 'UnavailableRedditor', name: string, id: string }
        , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
            | { __typename: 'DeletedRedditor', id: string, name: string }
            | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
            | { __typename: 'UnavailableRedditor', id: string, name: string }
           }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
          | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
          | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
              | { __typename: 'DeletedRedditor', id: string, displayName: string }
              | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
              | { __typename: 'UnavailableRedditor', id: string, displayName: string }
             }
          | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
        > | null, lastAuthorModNote?:
          | { __typename: 'ModUserNote', label: ModUserNoteLabel }
          | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
          | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
         | null } | null }
    | { __typename: 'SubredditPost', commentCount: number, id: string, title: string, commentForest: { __typename: 'CommentForest', pageInfo?: { __typename?: 'PageInfo', commentCount?: number | null, hasNextPage?: boolean | null }, trees: Array<{ __typename?: 'CommentTree', depth: number, parentId: string, childCount: number, more?: { __typename?: 'More', count: number, cursor: string, isTooDeepForCount: boolean } | null, node?:
            | { __typename: 'Comment', id: string, createdAt: string, editedAt: number, isAdminTakedown: boolean, isRemoved: boolean, removedByCategory: RemovedByCategory, isLocked: boolean, isGildable?: boolean, isInitiallyCollapsed: boolean, initiallyCollapsedReason: CommentCollapsedReason, isTranslatable: boolean, languageCode: string, score: number, voteState: VoteState, isSaved: boolean, followedForNotificationsStatus?: CommentFollowedStatus, isStickied: boolean, isScoreHidden: boolean, isArchived: boolean, distinguishedAs: boolean, permalink: string, isCommercialCommunication: boolean, content: { __typename: 'Content', markdown: string, html?: string, preview: string, richtext: string, typeHint: ContentType, translationInfo: { __typename?: 'TranslationInfo', isTranslated: boolean, translatedLanguage: string }, richtextMedia:
                  | { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                  | { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                  | { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } }
                 }, authorInfo:
                | { __typename: 'DeletedRedditor', name: string, id: string }
                | { __typename: 'Redditor', isPremiumAvatarTreatment: boolean, name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean }, attributes?: { __typename?: 'RedditorAttributes', redditorType?: RedditorType, verificationStatus?: VerificationStatus, redditHandleInfo?: { __typename?: 'RedditHandleInfo', displayName: string, prefixedUsername: string, username: string } } | null }
                | { __typename: 'UnavailableRedditor', name: string, id: string }
              , authorCommunityBadge?: { __typename: 'AchievementBadge', label: string, accessibilityLabel: string, image: { __typename?: 'MediaSource', url?: string | null } } | null, authorFlair: { __typename: 'AuthorFlair', text: string, richtext: string, textColor: string, template: { __typename?: 'FlairTemplate', id: string, backgroundColor: string } }, awardings?: { __typename: 'AwardingTotal', total: number, awardingByCurrentUser: { __typename?: 'Award', id: string }, award: { __typename: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } } }, moderationInfo: { __typename: 'CommentModerationInfo', isAutoCollapsedFromCrowdControl: boolean, verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, isRemoved: boolean, proxyAuthor:
                  | { __typename?: 'DeletedRedditor', id: string, displayName: string }
                  | { __typename?: 'Redditor', id: string, displayName: string }
                  | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
                , verdictByRedditorInfo:
                  | { __typename: 'DeletedRedditor', id: string, name: string }
                  | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                  | { __typename: 'UnavailableRedditor', id: string, name: string }
                , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
                    | { __typename: 'DeletedRedditor', id: string, name: string }
                    | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                    | { __typename: 'UnavailableRedditor', id: string, name: string }
                   }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
                  | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
                  | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                  | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
                      | { __typename: 'DeletedRedditor', id: string, displayName: string }
                      | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                      | { __typename: 'UnavailableRedditor', id: string, displayName: string }
                     }
                  | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                  | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
                > | null, lastAuthorModNote?:
                  | { __typename: 'ModUserNote', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
                 | null }, commentStats?: { __typename?: 'CommentStats', viewCountTotals?: { __typename?: 'ViewCountTotals', totalCount?: number | null } | null }, modContentDiscussion?: { __typename: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
                  | { __typename?: 'DeletedRedditor', id: string, displayName: string }
                  | { __typename?: 'Redditor', id: string, displayName: string }
                  | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
                 } | null }
            | { __typename: 'DeletedComment', isInitiallyCollapsed: boolean, createdAt: string, removedByCategory: RemovedByCategory, moderationInfo: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, verdictByRedditorInfo:
                  | { __typename: 'DeletedRedditor', id: string, name: string }
                  | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                  | { __typename: 'UnavailableRedditor', id: string, name: string }
                , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
                    | { __typename: 'DeletedRedditor', id: string, name: string }
                    | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
                    | { __typename: 'UnavailableRedditor', id: string, name: string }
                   }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, lastAuthorModNote?:
                  | { __typename: 'ModUserNote', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
                  | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
                 | null } }
           | null }> }, subreddit: { __typename?: 'Subreddit', id: string, name: string, prefixedName: string, allowedMediaInComments: Array<CommentMediaType | null>, isQuarantined: boolean, moderation: { __typename?: 'Moderation', isShowCommentRemovalReasonPrompt?: boolean | null }, tippingStatus: { __typename?: 'TippingStatus', isEnabled?: boolean | null } }, moderationInfo?: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, verdictReason?: string | null, banReason: string, reportCount: number, isReportingIgnored: boolean, isRemoved: boolean, verdictByRedditorInfo:
          | { __typename: 'DeletedRedditor', name: string, id: string }
          | { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } }
          | { __typename: 'UnavailableRedditor', name: string, id: string }
        , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
            | { __typename: 'DeletedRedditor', id: string, name: string }
            | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
            | { __typename: 'UnavailableRedditor', id: string, name: string }
           }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
          | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
          | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
              | { __typename: 'DeletedRedditor', id: string, displayName: string }
              | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
              | { __typename: 'UnavailableRedditor', id: string, displayName: string }
             }
          | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
        > | null, lastAuthorModNote?:
          | { __typename: 'ModUserNote', label: ModUserNoteLabel }
          | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
          | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
         | null } | null }
   | null };

export type RedditorNameFragment_DeletedRedditor_Fragment = { __typename: 'DeletedRedditor', id: string, name: string };

export type RedditorNameFragment_Redditor_Fragment = { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } };

export type RedditorNameFragment_UnavailableRedditor_Fragment = { __typename: 'UnavailableRedditor', id: string, name: string };

export type RedditorNameFragmentFragment =
  | RedditorNameFragment_DeletedRedditor_Fragment
  | RedditorNameFragment_Redditor_Fragment
  | RedditorNameFragment_UnavailableRedditor_Fragment
;

export type ModReportsFragmentFragment = { __typename?: 'CommentModerationInfo', modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
      | { __typename: 'DeletedRedditor', id: string, name: string }
      | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
      | { __typename: 'UnavailableRedditor', id: string, name: string }
     }> | null };

export type UserReportsFragmentFragment = { __typename?: 'CommentModerationInfo', userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null };

export type ModQueueTriggersFragmentFragment = { __typename?: 'CommentModerationInfo', modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null };

export type MediaSourceFragmentFragment = { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null };

export type ModQueueReasonsFragmentFragment = { __typename?: 'CommentModerationInfo', modQueueReasons?: Array<
    | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
    | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
    | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
        | { __typename: 'DeletedRedditor', id: string, displayName: string }
        | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
        | { __typename: 'UnavailableRedditor', id: string, displayName: string }
       }
    | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
    | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
  > | null };

export type AuthorInfoFragment_DeletedRedditor_Fragment = { __typename: 'DeletedRedditor', name: string, id: string };

export type AuthorInfoFragment_Redditor_Fragment = { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } };

export type AuthorInfoFragment_UnavailableRedditor_Fragment = { __typename: 'UnavailableRedditor', name: string, id: string };

export type AuthorInfoFragmentFragment =
  | AuthorInfoFragment_DeletedRedditor_Fragment
  | AuthorInfoFragment_Redditor_Fragment
  | AuthorInfoFragment_UnavailableRedditor_Fragment
;

export type LastAuthorModNoteFragmentFragment = { __typename?: 'CommentModerationInfo', lastAuthorModNote?:
    | { __typename: 'ModUserNote', label: ModUserNoteLabel }
    | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
    | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
   | null };

export type PdsBasicPostInfoFragment_DeletedSubredditPost_Fragment = { __typename: 'DeletedSubredditPost', id: string, title: string, moderationInfo?: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, verdictReason?: string | null, banReason: string, reportCount: number, isReportingIgnored: boolean, isRemoved: boolean, verdictByRedditorInfo:
      | { __typename: 'DeletedRedditor', name: string, id: string }
      | { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } }
      | { __typename: 'UnavailableRedditor', name: string, id: string }
    , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
        | { __typename: 'DeletedRedditor', id: string, name: string }
        | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
        | { __typename: 'UnavailableRedditor', id: string, name: string }
       }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
      | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
      | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
          | { __typename: 'DeletedRedditor', id: string, displayName: string }
          | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
          | { __typename: 'UnavailableRedditor', id: string, displayName: string }
         }
      | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
    > | null, lastAuthorModNote?:
      | { __typename: 'ModUserNote', label: ModUserNoteLabel }
      | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
      | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
     | null } | null };

export type PdsBasicPostInfoFragment_ProfilePost_Fragment = { __typename: 'ProfilePost', id: string, title: string, profile: { __typename?: 'Profile', redditorInfo:
      | { __typename: 'DeletedRedditor', id: string, name: string }
      | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
      | { __typename: 'UnavailableRedditor', id: string, name: string }
     }, moderationInfo?: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, verdictReason?: string | null, banReason: string, reportCount: number, isReportingIgnored: boolean, isRemoved: boolean, verdictByRedditorInfo:
      | { __typename: 'DeletedRedditor', name: string, id: string }
      | { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } }
      | { __typename: 'UnavailableRedditor', name: string, id: string }
    , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
        | { __typename: 'DeletedRedditor', id: string, name: string }
        | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
        | { __typename: 'UnavailableRedditor', id: string, name: string }
       }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
      | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
      | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
          | { __typename: 'DeletedRedditor', id: string, displayName: string }
          | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
          | { __typename: 'UnavailableRedditor', id: string, displayName: string }
         }
      | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
    > | null, lastAuthorModNote?:
      | { __typename: 'ModUserNote', label: ModUserNoteLabel }
      | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
      | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
     | null } | null };

export type PdsBasicPostInfoFragment_SubredditPost_Fragment = { __typename: 'SubredditPost', id: string, title: string, subreddit: { __typename?: 'Subreddit', id: string, name: string, prefixedName: string, allowedMediaInComments: Array<CommentMediaType | null>, isQuarantined: boolean, moderation: { __typename?: 'Moderation', isShowCommentRemovalReasonPrompt?: boolean | null }, tippingStatus: { __typename?: 'TippingStatus', isEnabled?: boolean | null } }, moderationInfo?: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, verdictReason?: string | null, banReason: string, reportCount: number, isReportingIgnored: boolean, isRemoved: boolean, verdictByRedditorInfo:
      | { __typename: 'DeletedRedditor', name: string, id: string }
      | { __typename: 'Redditor', name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean } }
      | { __typename: 'UnavailableRedditor', name: string, id: string }
    , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
        | { __typename: 'DeletedRedditor', id: string, name: string }
        | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
        | { __typename: 'UnavailableRedditor', id: string, name: string }
       }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
      | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
      | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
          | { __typename: 'DeletedRedditor', id: string, displayName: string }
          | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
          | { __typename: 'UnavailableRedditor', id: string, displayName: string }
         }
      | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
    > | null, lastAuthorModNote?:
      | { __typename: 'ModUserNote', label: ModUserNoteLabel }
      | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
      | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
     | null } | null };

export type PdsBasicPostInfoFragmentFragment =
  | PdsBasicPostInfoFragment_DeletedSubredditPost_Fragment
  | PdsBasicPostInfoFragment_ProfilePost_Fragment
  | PdsBasicPostInfoFragment_SubredditPost_Fragment
;

export type MediaAuthInfoFragmentFragment = { __typename?: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string };

export type PackagedMediaFragmentFragment = { __typename?: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null };

export type VideoAssetFragmentFragment = { __typename?: 'VideoAsset', dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } };

export type ImageAssetFragmentFragment = { __typename: 'ImageAsset', id: string, status: MediaAssetStatus, mimetype: string, width: number, height: number, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } };

export type AnimatedImageAssetFragmentFragment = { __typename: 'AnimatedImageAsset', id: string, status: MediaAssetStatus, mimetype: string, width: number, height: number, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } };

export type MediaAssetFragment_AnimatedImageAsset_Fragment = { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } };

export type MediaAssetFragment_ImageAsset_Fragment = { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } };

export type MediaAssetFragment_VideoAsset_Fragment = { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } };

export type MediaAssetFragmentFragment =
  | MediaAssetFragment_AnimatedImageAsset_Fragment
  | MediaAssetFragment_ImageAsset_Fragment
  | MediaAssetFragment_VideoAsset_Fragment
;

export type RichtextMediaFragmentFragment = { __typename?: 'Content', richtextMedia:
    | { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
    | { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
    | { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } }
   };

export type RedditorAttributesFragmentFragment = { __typename?: 'Redditor', attributes?: { __typename?: 'RedditorAttributes', redditorType?: RedditorType, verificationStatus?: VerificationStatus, redditHandleInfo?: { __typename?: 'RedditHandleInfo', displayName: string, prefixedUsername: string, username: string } } | null };

export type AuthorFlairFragmentFragment = { __typename?: 'AuthorFlair', text: string, richtext: string, textColor: string, template: { __typename?: 'FlairTemplate', id: string, backgroundColor: string } };

export type AwardFragmentFragment = { __typename?: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } };

export type AwardingTotalFragmentFragment = { __typename?: 'AwardingTotal', total: number, award: { __typename: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } } };

export type ModContentDiscussionsFragmentFragment = { __typename?: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
    | { __typename?: 'DeletedRedditor', id: string, displayName: string }
    | { __typename?: 'Redditor', id: string, displayName: string }
    | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
   };

export type ModContentDiscussionsCommentFragment = { __typename?: 'Comment', modContentDiscussion?: { __typename: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
      | { __typename?: 'DeletedRedditor', id: string, displayName: string }
      | { __typename?: 'Redditor', id: string, displayName: string }
      | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
     } | null };

export type CommentFragmentFragment = { __typename: 'Comment', id: string, createdAt: string, editedAt: number, isAdminTakedown: boolean, isRemoved: boolean, removedByCategory: RemovedByCategory, isLocked: boolean, isGildable?: boolean, isInitiallyCollapsed: boolean, initiallyCollapsedReason: CommentCollapsedReason, isTranslatable: boolean, languageCode: string, score: number, voteState: VoteState, isSaved: boolean, followedForNotificationsStatus?: CommentFollowedStatus, isStickied: boolean, isScoreHidden: boolean, isArchived: boolean, distinguishedAs: boolean, permalink: string, isCommercialCommunication: boolean, content: { __typename: 'Content', markdown: string, html?: string, preview: string, richtext: string, typeHint: ContentType, translationInfo: { __typename?: 'TranslationInfo', isTranslated: boolean, translatedLanguage: string }, richtextMedia:
      | { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
      | { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
      | { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } }
     }, authorInfo:
    | { __typename: 'DeletedRedditor', name: string, id: string }
    | { __typename: 'Redditor', isPremiumAvatarTreatment: boolean, name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean }, attributes?: { __typename?: 'RedditorAttributes', redditorType?: RedditorType, verificationStatus?: VerificationStatus, redditHandleInfo?: { __typename?: 'RedditHandleInfo', displayName: string, prefixedUsername: string, username: string } } | null }
    | { __typename: 'UnavailableRedditor', name: string, id: string }
  , authorCommunityBadge?: { __typename: 'AchievementBadge', label: string, accessibilityLabel: string, image: { __typename?: 'MediaSource', url?: string | null } } | null, authorFlair: { __typename: 'AuthorFlair', text: string, richtext: string, textColor: string, template: { __typename?: 'FlairTemplate', id: string, backgroundColor: string } }, awardings?: { __typename: 'AwardingTotal', total: number, awardingByCurrentUser: { __typename?: 'Award', id: string }, award: { __typename: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } } }, moderationInfo: { __typename: 'CommentModerationInfo', isAutoCollapsedFromCrowdControl: boolean, verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, isRemoved: boolean, proxyAuthor:
      | { __typename?: 'DeletedRedditor', id: string, displayName: string }
      | { __typename?: 'Redditor', id: string, displayName: string }
      | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
    , verdictByRedditorInfo:
      | { __typename: 'DeletedRedditor', id: string, name: string }
      | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
      | { __typename: 'UnavailableRedditor', id: string, name: string }
    , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
        | { __typename: 'DeletedRedditor', id: string, name: string }
        | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
        | { __typename: 'UnavailableRedditor', id: string, name: string }
       }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
      | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
      | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
          | { __typename: 'DeletedRedditor', id: string, displayName: string }
          | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
          | { __typename: 'UnavailableRedditor', id: string, displayName: string }
         }
      | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
      | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
    > | null, lastAuthorModNote?:
      | { __typename: 'ModUserNote', label: ModUserNoteLabel }
      | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
      | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
     | null }, commentStats?: { __typename?: 'CommentStats', viewCountTotals?: { __typename?: 'ViewCountTotals', totalCount?: number | null } | null }, modContentDiscussion?: { __typename: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
      | { __typename?: 'DeletedRedditor', id: string, displayName: string }
      | { __typename?: 'Redditor', id: string, displayName: string }
      | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
     } | null };

export type DeletedCommentFragmentFragment = { __typename?: 'DeletedComment', isInitiallyCollapsed: boolean, createdAt: string, removedByCategory: RemovedByCategory, moderationInfo: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, verdictByRedditorInfo:
      | { __typename: 'DeletedRedditor', id: string, name: string }
      | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
      | { __typename: 'UnavailableRedditor', id: string, name: string }
    , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
        | { __typename: 'DeletedRedditor', id: string, name: string }
        | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
        | { __typename: 'UnavailableRedditor', id: string, name: string }
       }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, lastAuthorModNote?:
      | { __typename: 'ModUserNote', label: ModUserNoteLabel }
      | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
      | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
     | null } };

export type CommentForestTreesFragmentFragment = { __typename?: 'CommentForest', trees: Array<{ __typename?: 'CommentTree', depth: number, parentId: string, childCount: number, more?: { __typename?: 'More', count: number, cursor: string, isTooDeepForCount: boolean } | null, node?:
      | { __typename: 'Comment', id: string, createdAt: string, editedAt: number, isAdminTakedown: boolean, isRemoved: boolean, removedByCategory: RemovedByCategory, isLocked: boolean, isGildable?: boolean, isInitiallyCollapsed: boolean, initiallyCollapsedReason: CommentCollapsedReason, isTranslatable: boolean, languageCode: string, score: number, voteState: VoteState, isSaved: boolean, followedForNotificationsStatus?: CommentFollowedStatus, isStickied: boolean, isScoreHidden: boolean, isArchived: boolean, distinguishedAs: boolean, permalink: string, isCommercialCommunication: boolean, content: { __typename: 'Content', markdown: string, html?: string, preview: string, richtext: string, typeHint: ContentType, translationInfo: { __typename?: 'TranslationInfo', isTranslated: boolean, translatedLanguage: string }, richtextMedia:
            | { __typename: 'AnimatedImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, mp4Url?: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
            | { __typename: 'ImageAsset', id: string, userId: string, mimetype: string, width: number, height: number, status: MediaAssetStatus, url: string, small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_small: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_medium: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_large: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, obfuscated_xxxlarge: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
            | { __typename: 'VideoAsset', id: string, userId: string, mimetype: string, width: number, height: number, dashUrl: string, hlsUrl: string, status?: MediaAssetStatus, packagedMedia?: { __typename: 'PackagedMedia', muxedMp4s?: { __typename?: 'MuxedMp4s', low?: { __typename?: 'MediaSource', url?: string | null } | null, medium?: { __typename?: 'MediaSource', url?: string | null } | null, high?: { __typename?: 'MediaSource', url?: string | null } | null, highest?: { __typename?: 'MediaSource', url?: string | null } | null, recommended?: { __typename?: 'MediaSource', url?: string | null } | null } | null, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } | null }, still?: { __typename?: 'StillMedia', content: { __typename?: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }, authInfo?: { __typename: 'MediaAuthInfo', authToken: string, authTokenExpiresAt: number, authTokenId: string } }
           }, authorInfo:
          | { __typename: 'DeletedRedditor', name: string, id: string }
          | { __typename: 'Redditor', isPremiumAvatarTreatment: boolean, name: string, isBlocked: boolean, isCakeDayNow: boolean, accountType: AccountType, id: string, newIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, profile: { __typename?: 'Profile', isNsfw: boolean }, attributes?: { __typename?: 'RedditorAttributes', redditorType?: RedditorType, verificationStatus?: VerificationStatus, redditHandleInfo?: { __typename?: 'RedditHandleInfo', displayName: string, prefixedUsername: string, username: string } } | null }
          | { __typename: 'UnavailableRedditor', name: string, id: string }
        , authorCommunityBadge?: { __typename: 'AchievementBadge', label: string, accessibilityLabel: string, image: { __typename?: 'MediaSource', url?: string | null } } | null, authorFlair: { __typename: 'AuthorFlair', text: string, richtext: string, textColor: string, template: { __typename?: 'FlairTemplate', id: string, backgroundColor: string } }, awardings?: { __typename: 'AwardingTotal', total: number, awardingByCurrentUser: { __typename?: 'Award', id: string }, award: { __typename: 'Award', id: string, name: string, tags: string, static_icon_16: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_24: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_32: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_48: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, static_icon_64: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } } }, moderationInfo: { __typename: 'CommentModerationInfo', isAutoCollapsedFromCrowdControl: boolean, verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, isRemoved: boolean, proxyAuthor:
            | { __typename?: 'DeletedRedditor', id: string, displayName: string }
            | { __typename?: 'Redditor', id: string, displayName: string }
            | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
          , verdictByRedditorInfo:
            | { __typename: 'DeletedRedditor', id: string, name: string }
            | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
            | { __typename: 'UnavailableRedditor', id: string, name: string }
          , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
              | { __typename: 'DeletedRedditor', id: string, name: string }
              | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
              | { __typename: 'UnavailableRedditor', id: string, name: string }
             }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, modQueueReasons?: Array<
            | { __typename: 'ModQueueReasonFilter', title: string, icon: ModQueueReasonIcon, isSafetyFilter: boolean, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, confidence: { __typename?: 'FilterConfidence', confidenceLevelText: string } }
            | { __typename: 'ModQueueReasonHiddenUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
            | { __typename: 'ModQueueReasonModReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string }, actor:
                | { __typename: 'DeletedRedditor', id: string, displayName: string }
                | { __typename: 'Redditor', id: string, displayName: string, icon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, iconSmall: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null }, snoovatarIcon: { __typename: 'MediaSource', url?: string | null, dimensions?: { __typename?: 'Dimensions', width?: number | null, height?: number | null } | null } }
                | { __typename: 'UnavailableRedditor', id: string, displayName: string }
               }
            | { __typename: 'ModQueueReasonReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
            | { __typename: 'ModQueueReasonUserReport', title: string, icon: ModQueueReasonIcon, description: { __typename?: 'Content', markdown: string, richtext: string, preview: string } }
          > | null, lastAuthorModNote?:
            | { __typename: 'ModUserNote', label: ModUserNoteLabel }
            | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
            | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
           | null }, commentStats?: { __typename?: 'CommentStats', viewCountTotals?: { __typename?: 'ViewCountTotals', totalCount?: number | null } | null }, modContentDiscussion?: { __typename: 'ModContentDiscussion', createdAt: string, chatChannel: { __typename?: 'ChatChannel', id: string, roomId: string, name: string, isRestricted: boolean }, chatMessage: { __typename?: 'ChatMessage', id: string }, sharedByModerator:
            | { __typename?: 'DeletedRedditor', id: string, displayName: string }
            | { __typename?: 'Redditor', id: string, displayName: string }
            | { __typename?: 'UnavailableRedditor', id: string, displayName: string }
           } | null }
      | { __typename: 'DeletedComment', isInitiallyCollapsed: boolean, createdAt: string, removedByCategory: RemovedByCategory, moderationInfo: { __typename: 'CommentModerationInfo', verdict: ModerationVerdict, verdictAt: string, banReason: string, reportCount: number, verdictByRedditorInfo:
            | { __typename: 'DeletedRedditor', id: string, name: string }
            | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
            | { __typename: 'UnavailableRedditor', id: string, name: string }
          , modReports?: Array<{ __typename?: 'ModReport', reason: string, authorInfo:
              | { __typename: 'DeletedRedditor', id: string, name: string }
              | { __typename: 'Redditor', id: string, name: string, prefixedName: string, accountType: AccountType, iconSmall: { __typename?: 'MediaSource', url?: string | null }, snoovatarIcon: { __typename?: 'MediaSource', url?: string | null } }
              | { __typename: 'UnavailableRedditor', id: string, name: string }
             }> | null, userReports?: Array<{ __typename?: 'UserReport', reason: string, count: number }> | null, modQueueTriggers?: { __typename?: 'ModQueueTriggers', type: ModQueueTriggerType, message: string, details: { __typename: 'BanEvasionTriggerDetails', confidence: BanEvasionConfidence, recencyExplanation: { __typename?: 'Description', markdown: string, richtext: string }, confidenceExplanation: { __typename?: 'Description', markdown: string } } } | null, lastAuthorModNote?:
            | { __typename: 'ModUserNote', label: ModUserNoteLabel }
            | { __typename: 'ModUserNoteComment', label: ModUserNoteLabel }
            | { __typename: 'ModUserNotePost', label: ModUserNoteLabel }
           | null } }
     | null }> };
