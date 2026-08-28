import { getLogger } from "../../../logging";
import { getState } from "../../../main";
import type { SubredditState } from "../types/state";
import type { Subreddit, SubredditAboutInfo } from "../types/subreddit";
import { processSubredditPostFlair, processSubredditUserFlair } from "./flair";

const logger = getLogger('gateway:map:subreddit');
export const subredditNameToId: Record<string, string> = {};

export const processSubredditAboutInfo = (data: any): SubredditAboutInfo => ({
	acceptFollowers: data.accept_followers,
	accountsActive: 0,
	advertiserCategory: data.advertiser_category,
	allOriginalContent: data.all_original_content,
	allowedPostTypes: {
		links: data.submission_type === "any" || data.submission_type === "link",
		images: data.allow_images,
		videos: data.allow_videos,
		text: data.submission_type === "any" || data.submission_type === "self",
		spoilers: data.spoilers_enabled,
		polls: data.allow_polls,
		galleries: data.allow_galleries,
		talks: false
	},
	allowedMediaInComments: data.allowed_media_in_comments?.map((str: string) => str.toUpperCase()) ?? [],
	contentCategory: "",
	created: data.created_utc,
	detectedLanguage: data.detected_language,
	disableContributorRequests: data.disable_contributor_requests,
	emojisEnabled: data.emojis_enabled ?? true,
	hasExternalAccount: false,
	isCrosspostableSubreddit: data.is_crosspostable_subreddit,
	isMediaInCommentsSettingShown: data.should_show_media_in_comments_setting ?? true,
	isMuted: false,
	notificationLevel: data.notification_level?.toUpperCase(),
	originalContentTagEnabled: data.original_content_tag_enabled,
	publicDescription: data.public_description,
	restrictCommenting: data.restrict_commenting,
	restrictPosting: data.restrict_posting,
	shouldArchivePosts: data.should_archive_posts,
	showMedia: data.show_media,
	submitLinkLabel: data.submit_link_label,
	submitTextLabel: data.submit_text_label,
	subscribers: data.subscribers,
	userIsBanned: data.user_is_banned,
	userIsContributor: data.user_is_contributor,
	userIsSubscriber: data.user_is_subscriber,
	usingNewModmail: true,
});

export const processSubreddit = (data: any): Subreddit => ({
	acceptFollowers: data.accept_followers,
	allowChatPostCreation: false,
	allowPredictions: false,
	allowPredictionsTournament: false,
	communityIcon: data.community_icon,
	displayText: data.display_name_prefixed,
	freeFormReports: data.free_form_reports,
	icon: { url: data.icon_img, width: data.icon_size?.[0], height: data.icon_size?.[1] },
	id: data.name,
	isChatPostFeatureEnabled: false,
	isNSFW: data.over_18,
	isQuarantined: data.quarantine,
	name: data.display_name,
	primaryColor: data.primary_color,
	subscribers: data.subscribers,
	title: data.title,
	type: data.subreddit_type,
	url: data.url,
	whitelistStatus: "no_ads",
	wls: 6,
});


export const addR2SubredditToState = (state: SubredditState, r2Subreddit: any, userFlairsV2?: any, postFlairsV2?: any) => {
	if (!r2Subreddit) return;

	const id = r2Subreddit.name;

	if (r2Subreddit.__typename) {
		logger.dbg(`Loading subreddit info for r/${r2Subreddit.name} from state`);
		state.subredditAboutInfo[id] = (getState().subreddits.about as any)[id];
		state.subreddits[id] = (getState().subreddits.models as any)[id];
		return;
	}
	state.subredditAboutInfo[id] ??= processSubredditAboutInfo(r2Subreddit);
	state.subreddits[id] ??= processSubreddit(r2Subreddit);
	state.postFlair[id] ??= processSubredditPostFlair(r2Subreddit, postFlairsV2);
	state.userFlair[id] ??= processSubredditUserFlair(r2Subreddit, userFlairsV2);
}