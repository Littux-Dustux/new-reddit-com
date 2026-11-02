import type { SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node as GqlPost, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost_crosspostRoot_CrosspostRoot_post_Post_poll_PostPoll as GqlPoll, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_ProfilePost, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_SubredditPost, DevvitPostFragmentFragment, GetDevvitPostDataQuery } from "../../../../api/types/gql"
import { getLogger } from "../../../../logging";
import { getState } from "../../../../main";
import type { CommentSort } from "../../types/common";
import type { PostFlair } from "../../types/flair";
import type { Media, MediaGallery, MediaRichtext, MediaText, PollData, Post } from "../../types/post";
import type { StateBase } from "../../types/state";
import { getAuthorFlairFromR2Thing, processSubredditPostFlair, processSubredditPostFlairGql, processSubredditUserFlair, processSubredditUserFlairGql } from "../flair";
import { convertDevvitDataToIFrame } from "../posts";
import { processSubredditAboutInfo, processSubreddit } from "../subreddit";
import { mapAdEvents } from "./ads";
import { processAwards } from "./award";
import { convertGqlMediaAssets, convertGqlResolutions, convertSingleGqlMediaAsset } from "./common";
import { getAuthorFlairFromGqlThing } from "./flair";
import { mapModerationInfoCommon } from "./moderationInfo";
import { processSubredditAboutInfoGql, processSubredditGql } from "./subreddit";

const logger = getLogger('mapPostGql');
type GqlPostNonDeleted = SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost | SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_ProfilePost | SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_SubredditPost;

const vq = {
	low: 360,
	medium: 480,
	high: 720,
	highest: 1080
}

const getMedia = (data: GqlPostNonDeleted, devvitData?: DevvitPostFragmentFragment): Media | null => {
	const media = data.media;
	const obfuscatedUrl = (data.isNsfw || data.isSpoiler) && media?.obfuscated_still
		? media.obfuscated_still.small.url
		: null;
	const baseMedia = {
		obfuscated: obfuscatedUrl,
		...(data.content && {
			markdownContent: data.content.markdown,
			richtextContent: JSON.parse(data.content.richtext),
			mediaMetadata: convertGqlMediaAssets(data.content.richtextMedia),
		})
	} as MediaText | MediaRichtext;


	if (devvitData?.__typename === "DevvitPost") {
		return {
			...baseMedia,
			content: `devvit:http://${location.host}/embed.html?${encodeURIComponent(convertDevvitDataToIFrame(devvitData).outerHTML)}`,
			type: "embed",
			width: 640,
			height: 512,
			provider: "reddit",
		};
	};

	if (data.gallery) {
		const galleryImages = data.gallery.items || [];
		const mappedItems: MediaGallery['gallery']['items'] = [];
		baseMedia.mediaMetadata ??= {};

		for (const it of galleryImages) {
			baseMedia.mediaMetadata[it.media.id] = convertSingleGqlMediaAsset(it.media);
			mappedItems.push({
				adEvents: it.adEvents ? mapAdEvents(it.adEvents) : [],
				caption: it.caption,
				callToAction: it.callToAction,
				displayAddress: it.displayAddress,
				id: Number(it.id),
				mediaId: it.media.id,
			})
		}

		return {
			...baseMedia,
			type: "gallery",
			gallery: {
				items: mappedItems
			},
		}
	};
	
	switch (media?.typeHint) {
		case "IMAGE":
			const still = media.still;
			if (still) {
				return {
					...baseMedia,
					...still.source.dimensions,
					type: "image",
					content: still.source.url,
					resolutions: convertGqlResolutions(still),
				};
			};
			break;

		case "VIDEO":
			const str = media.streaming;
			const pkg = media.packagedMedia;
			if (str) {
				return {
					...baseMedia,
					...str.dimensions,
					type: "video",
					hlsUrl: str.hlsUrl,
					dashUrl: str.dashUrl,
					isGif: str.isGif,
					scrubberThumbSource: str.scrubberMediaUrl,
					posterUrl: media.still?.source.url as string,
					packagedMedia: {
						playbackMp4s: {
							duration: 0,
							permutations: media.packagedMedia.muxedMp4s ? Object.entries(media.packagedMedia.muxedMp4s)
								.filter(([k, v]) => v && k !== "recommended")
								.map(([k, v]) => ({
									source: {
										url: v.url,
										videoCodec: 'H264',
										dimensions: {
											width: 1080,
											height: vq[k],
										}
									},
								})) : []
						}
					}
				}
			};
			break;

		case "GIFVIDEO":
			const anim = media.animated;
			if (anim?.mp4_source && media.still) {
				return {
					...baseMedia,
					...anim.mp4_source.dimensions as { width: number, height: number },
					type: "gifvideo",
					content: anim.mp4_source.url,
					gifBackgroundImage: media.still?.source.url as string,
					resolutions: convertGqlResolutions(anim, 'mp4_'),
				};
			};
			break;

		case "EMBED":
			if (media.video) {
				return {
					...baseMedia,
					...media.video.dimensions,
					type: "embed",
					content: `https://www.redditmedia.com/mediaembed/${data.id.slice(3)}?responsive=true&is_nightmode=true`,
					provider: media.video.attribution.providerName as string,
				}
			};
			break;
	};

	if (data.isSelfPost) {
		baseMedia.type = "rtjson";
		return baseMedia;
	};

	if (baseMedia.richtextContent) return baseMedia;

	return null;
};

const getFlair = (post: GqlPostNonDeleted): PostFlair[] => {
	const flairIndicators: PostFlair[] = [];
	const flair = post.flair;

	if (flair) {
		if (flair.richtext) {
			flairIndicators.push({
				type: "richtext",
				richtext: JSON.parse(flair.richtext),
				textColor: flair.textColor?.toLowerCase() as "light" | "dark" || "dark",
				backgroundColor: flair.template.backgroundColor || "",
				cssClass: null,
				templateId: flair.template.id,
			});
		}
		if (typeof flair.text === 'string') {
			flairIndicators.push({
				type: "text",
				text: flair.text,
				textColor: flair.textColor?.toLowerCase() as "light" | "dark" || "dark",
				backgroundColor: flair.template.backgroundColor || "",
				cssClass: null,
				templateId: flair.template.id,
			});
		}
	}
	if (post.isSpoiler) flairIndicators.push({ text: "spoiler", type: "spoiler" });
	if (post.isNsfw) flairIndicators.push({ text: "nsfw", type: "nsfw" });
	return flairIndicators;
};

const processGqlPoll = (poll: GqlPoll): PollData => {
	return {
		options: poll.options,
		resolvedOptionId: poll.resolvedOptionId,
		totalVoteCount: poll.totalVoteCount,
		userSelection: poll.selectedOptionId,
		voteUpdatesRemained: null,
		votingEndTimestamp: Date.parse(poll.votingEndsAt),
	}
};

// Based on new reddit's own code
const redditMediaDomains = /i\.redd\.it|v\.redd\.it|i\.reddituploads\.com|preview\.redd\.it|cf\.preview\.redd\.it/;
function getSource(post: GqlPostNonDeleted) {
	if (post.__typename === "AdPost" || (!post.isSelfPost && !redditMediaDomains.test(post.domain || ""))) {
		const expirationTimestamp = post.outboundLink?.expiresAt ? Date.parse(post.outboundLink.expiresAt) : null;

		return {
			displayText: post.domain || "",
			url: post.url || "",
			...(post.outboundLink && {
				outboundUrl: post.outboundLink.url || undefined,
				outboundUrlCreated: expirationTimestamp ? expirationTimestamp - 3600000 : undefined,
				outboundUrlExpiration: expirationTimestamp || undefined,
			}),
		};
	};
	return null;
}


export function processGqlPost(post: GqlPost, subId?: string | null, devvit?: any): Post {
	if (post.__typename === "DeletedSubredditPost") {
		throw new Error("Unexpected 'DeletedSubredditPost' node");
	}

	const author = post.authorInfo.__typename === "Redditor" ? post.authorInfo : null;
	const subreddit = post.__typename === "SubredditPost" ? post.subreddit : post.profile;

	return {
		...processAwards(post.awardings ?? []),
		...mapModerationInfoCommon(post.moderationInfo),
		author: author?.name ?? "[deleted]",
		authorId: author?.id ?? null,
		authorIsBlocked: false,
		belongsTo: {
			type: post.__typename === "SubredditPost" ? 'subreddit' : 'profile',
			id: subreddit?.id ?? subId ?? ''
		},
		contestMode: post.isContestMode,
		created: Date.parse(post.createdAt),
		crosspostParentId: post.crosspostRoot?.post.id,
		crosspostRootId: post.crosspostRoot?.post.id,
		distinguishType: post.distinguishedAs?.toLowerCase(),
		domain: post.domain,
		domainOverride: null,
		editedAt: post.editedAt ? Date.parse(post.editedAt) : null,
		eventInfo: post.postEventInfo ? {
			eventIsLive: post.postEventInfo.isLive,
			eventStart: Date.parse(post.postEventInfo.startsAt) / 1000,
			eventEnd: Date.parse(post.postEventInfo.endsAt) / 1000,
		} : undefined,
		flair: getFlair(post),
		hidden: post.isHidden,
		id: post.id,
		isArchived: post.isArchived,
		isAuthorCakeday: author?.isCakeDayNow,
		isCrosspostable: post.isCrosspostable,
		isFollowed: post.isFollowed,
		isGildable: post.isGildable,
		isLocked: post.isLocked,
		isNSFW: post.isNsfw,
		isPinned: post.isStickied,
		isSpoiler: post.isSpoiler,
		isStickied: post.isStickied,
		media: getMedia(post, devvit),
		numComments: post.commentCount,
		numCrossposts: 0,
		numDuplicates: 0,
		permalink: post.permalink,
		pollData: post.poll ? processGqlPoll(post.poll) : null,
		postId: post.id,
		preview: post.media?.still
			? {
				url: post.media.still.source.url,
				...post.media.still.source.dimensions
			} : null,
		removedByCategory: post.removedByCategory,
		saved: post.isSaved,
		score: post.score,
		source: getSource(post),
		suggestedSort: post.suggestedCommentSort?.toLowerCase() as CommentSort | undefined,
		thumbnail: post.thumbnail
			? { url: post.thumbnail.url, ...post.thumbnail.dimensions }
			: { url: 'default', width: 0, height: 0 },
		title: post.title,
		upvoteRatio: post.upvoteRatio,
		viewCount: post.viewCount,
		voteState: post.voteState === "NONE" ? 0 : post.voteState === "UP" ? 1 : -1,
		...(post.__typename === "AdPost"
			? {
				adPromotedUserPostIds: post.promotedUserPosts?.map(p => (p as any).id),
				adSupplementaryText: post.adSupplementaryTextRichtext,
				callToAction: post.callToAction,
				events: mapAdEvents(post.adEvents),
				impressionId: post.impressionId,
				isCreatedFromAdsUi: post.isCreatedFromAdsUi,
				isSponsored: true,
				isSurveyAd: post.isSurveyAd,
			}
			: {
				events: [],
			}
		)
	}
}


export function addGqlPostToState(post: GqlPostNonDeleted, subId: string | null, state: StateBase, postWithDevvit?: GetDevvitPostDataQuery['postInfoById']) {
	// @ts-ignore
	state.posts[post.id] = processGqlPost(post, subId, postWithDevvit?.devvit);

	const crossPost = post.crosspostRoot?.post;
	if (crossPost) {
		// @ts-ignore
		addGqlPostToState(crossPost, null, state, postWithDevvit?.crosspostRoot?.postInfo);
	}

	const appState = getState();
	const sub = post.__typename === "SubredditPost" ? post.subreddit : post.profile;
	subId ??= sub?.id as string;
	state.authorFlair[subId] ??= {};
	state.authorFlair[subId][post.authorInfo.name] = getAuthorFlairFromGqlThing(post.authorFlair);

	if (sub) {
		if (!appState.postFlair[subId])
			state.postFlair[subId] ??= processSubredditPostFlairGql(sub);
		if (!appState.features.userFlair[subId])
			state.userFlair[subId] ??= processSubredditUserFlairGql(sub);
		state.subredditAboutInfo[subId] ??= processSubredditAboutInfoGql(sub);

		if (post.__typename === "SubredditPost") {
			state.subreddits[subId] ??= processSubredditGql(post.subreddit);
		} else {
			state.profiles[subId] ??= processSubredditGql(post.profile);
		}
	} else if (!state.subreddits[subId]) {
		//logger.err(`Missing subreddit data for ${subId}!`);
		if (!appState.subreddits.models[subId])
			// @ts-ignore
			state.subreddits[subId] ??= {
				displayText: 'r/',
				id: subId,
				name: '',
				icon: {
					width: 256,
					height: 256,
					url: "",
				},
				isQuarantined: false,
				subscribers: NaN,
				type: 'public',
				url: '/r//'
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
	return state;
}