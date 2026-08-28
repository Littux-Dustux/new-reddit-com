import { getLogger, showToast } from "../../logging";
import { getGIPHYGifsByIds } from "../../api/giphy";
import { gqlFetch } from "../../api/gql";
import { getVideoMediaMetadataGql, getMuxedMP4sDownloadRTJSON } from "./mappers/common";
import { getREST, RedditAPIError } from "../../api/rest";
import { subredditNameToId } from "./mappers/subreddit";
import { convertUnavailableGqlSubredditToGatewayError } from "./mappers/gql/subreddit";
import { getState } from "../../main";
import { markdownToRichText } from "./mappers/richtext";
import { FormattingFlag } from "./types/richtext";
import { isLoggedIn } from "../../state";
import { blockedByUserNames, isUserCurationActive } from "./listingPage";

const logger = getLogger('apiMigrate:gateway:utils');

export async function fixR2CommentsMedia(comments: Record<string, any>) {
	// some giphy comments don't have the proper metadata, and have {"status":"invalid"}. So we'll fetch it from GIPHY.
	const brokenGiphyCommentMediaMetadatas: Record<string, any[]> = {};
	const giphyIdsToFetch: Set<string> = new Set();

	// reddit doesn't include videos in comments on the old API
	const videoCommentIncompleteMedias: Record<string, any> = {};
	const videoCommentIdsToFetch: string[] = [];

	// get blocked user comments
	const blockedIds: string[] = [];

	for (const comment of Object.values(comments)) {
		if (comment.unrepliableReason === "NEAR_BLOCKER" && comment.media.richtextContent.document[0]?.c?.[0]?.t === "[unavailable]") {
			blockedIds.push(comment.id);
			continue;
		}

		const [firstMediaKey, firstMedia]: [string, any] = (comment.media.mediaMetadata && Object.entries(comment.media.mediaMetadata)[0]) ?? [null, null];

		if (firstMedia && firstMedia.status === "invalid" && firstMediaKey.startsWith("giphy|") ) {
			const giphyId = firstMediaKey.split("|")[1] as string;
			giphyIdsToFetch.add(giphyId);

			(brokenGiphyCommentMediaMetadatas[giphyId] ??= []).push({
				key: firstMediaKey,
				mediaMetadata: comment.media.mediaMetadata
			});

		} else if (comment.media.richtextContent.document.some((node: any) => node.e === "video")) {
			videoCommentIdsToFetch.push(comment.id);
			videoCommentIncompleteMedias[comment.id] = comment.media;
		}
	}

	const commentFixerPromises: Promise<void>[] = [];

	if (giphyIdsToFetch.size > 0) {
		logger.log(`Fetching ${giphyIdsToFetch.size} GIFs from GIPHY...`, true);
		commentFixerPromises.push(
			getGIPHYGifsByIds(giphyIdsToFetch).then(redditGiphyGifDatas => {
				for (const giphyId of giphyIdsToFetch) {
					const gifData = redditGiphyGifDatas[giphyId];
					const brokenMediaMetadatas = brokenGiphyCommentMediaMetadatas[giphyId];

					if (gifData && brokenMediaMetadatas) {
						for (const { key, mediaMetadata } of brokenMediaMetadatas) {
							gifData.id ??= key;
							mediaMetadata[key] = gifData;
						}
					}
				}
			}).catch(e => {
				logger.err("Error fetching GIPHY GIF data: " + (e as any).message);
			})
		);
	}

	if (videoCommentIdsToFetch.length > 0) {
		logger.log(`Loading ${videoCommentIdsToFetch.length} comments with videos...`, true);
		commentFixerPromises.push(
			gqlFetch("CommentMediaDetails", "4228949b61fb4a9c17aed04edc4be641a7c48a12fbd506151afde1ce0e335857", { ids: videoCommentIdsToFetch })
			.then(({ commentsByIds }) => {
				for (const comment of commentsByIds) {
					const incompleteMedia = videoCommentIncompleteMedias[comment.id];
					const videoAsset = comment.content?.richtextMedia?.[0];

					if (incompleteMedia && videoAsset?.status === "VALID") {
						incompleteMedia.mediaMetadata = {
							[videoAsset.id]: getVideoMediaMetadataGql(videoAsset)
						};
						const muxedMp4s = videoAsset.packagedMedia?.muxedMp4s;
						if (muxedMp4s) {
							incompleteMedia.richtextContent.document.push(...getMuxedMP4sDownloadRTJSON(muxedMp4s))
						}
					}
				}
			}).catch(e => {
				logger.err("Error fetching videos in comments: " + (e as any).message);
			})
		);
	}

	if (blockedIds.length > 0) {
		logger.log(`Loading ${blockedIds.length} comments from blocked user`, true);
		commentFixerPromises.push(
			getREST(`/api/info.json?id=${blockedIds.join(",")}&raw_json=1&profile_img=1&rtj=only`, { anonymous: true })
			.then(({ data: { children }}) => {
				for (const { data: { name, author, author_fullname, profile_img, rtjson }} of children) {
					const noticeText = `Comment ${name} loaded from logged-out API (why: u/${author} blocked you)`;
					blockedByUserNames.add(author.toLowerCase());

					const comment = comments[name];
					comment.author = author;
					comment.authorId = author_fullname;
					comment.profileImage = profile_img;
					comment.media.richtextContent = {
						document: rtjson.document.concat(
							{ e: "hr" },
							{ e: "par", c: [
								{ e: "text", t: noticeText, f: [[FormattingFlag.italic, 0, noticeText.length]] }
							]}
						)
					};
				}
			}).catch(e => {
				logger.err("Error fetching blocked comments data: " + (e as any).message);
			})
		);
	};

	await Promise.all(commentFixerPromises);
	return comments;
}


export const expectStatusCodes = new Set([403, 404]);

export async function fetchSubredditPageExtra(
	subredditName: string | null | undefined,
	includeStructuredStyles: boolean = true,
	fetchR2Subreddit: boolean,
): Promise<{ structuredStyles: any, subredditInfo: any, isSubredditR2: boolean, postFlairsV2: any, userFlairsV2: any, preferences?: any }> {

	if (!subredditName) return {
		structuredStyles: null,
		subredditInfo: null,
		postFlairsV2: null,
		userFlairsV2: null,
		isSubredditR2: false,
	}

	if (!includeStructuredStyles) {
		const id = subredditNameToId[subredditName.toLowerCase()];
		if (id) {
			return {
				structuredStyles: null,
				subredditInfo: { __typename: "__USE_CACHE__", id, name: subredditName },
				userFlairsV2: null,
				postFlairsV2: null,
				isSubredditR2: false,
			}
		}
	}

	let includeUserFlairs = isLoggedIn.value, includePostFlairs = isLoggedIn.value;
	if (isLoggedIn) {
		const id = subredditNameToId[subredditName.toLocaleLowerCase()];
		if (id) {
			includeUserFlairs = (getState().features.userFlair as any)[id]?.permissions?.canAssignOwn;
			includePostFlairs = (getState().postFlair as any)[id]?.displaySettings?.isEnabled;
		}
	}

	const [structuredStyles, postFlairsV2, userFlairsV2, gqlOrR2SubredditInfo] = await Promise.all([
		includeStructuredStyles && getREST(`/api/v1/structured_styles/${subredditName}.json?raw_json=1`)
		.catch(e => logger.err(`Error fetching structuredStyles for r/${subredditName}: ${e.message}`, true, e)),

		includePostFlairs && getREST(`/r/${subredditName}/api/link_flair_v2.json?raw_json=1`,
			{ expectStatusCodes }
		).catch(e => logger.err(`Error fetching post flairs for r/${subredditName}: ${e.message}`, true, e)),

		includeUserFlairs && getREST(`/r/${subredditName}/api/user_flair_v2.json?raw_json=1`,
			{ expectStatusCodes }
		).catch(e => logger.err(`Error fetching user flairs for r/${subredditName}: ${e.message}`, true, e)),

		fetchR2Subreddit
			? getREST(`/r/${subredditName}/about.json?raw_json=1`).catch(e => {
				if (e instanceof RedditAPIError) {
					fetchR2Subreddit = false;
					return gqlFetch("SubredditInfoByName", "6b9c1679e69097e1c6df364adc11183afe6e2b6545dd1c0c1cc8f7490448c3e5", {
						subredditName,
						loggedOutIsOptedIn: true,
						filterGated: true,
						includeRecapFields: false,
						includeWelcomePage: false,
						includeDevvitData: false,
					}).catch(e => logger.err(
						`Error fetching gql subreddit info for r/${subredditName}: ${e.message}`, true, e
					));
				};
				logger.err(`Error fetching r2 subreddit info for r/${subredditName}: ${e.message}`, true, e);
			})
			: gqlFetch("SubredditInfoByName", "6b9c1679e69097e1c6df364adc11183afe6e2b6545dd1c0c1cc8f7490448c3e5", {
				subredditName,
				loggedOutIsOptedIn: true,
				filterGated: true,
				includeRecapFields: false,
				includeWelcomePage: false,
				includeDevvitData: false,
			}).catch(e => logger.err(
				`Error fetching gql subreddit info for r/${subredditName}: ${e.message}`, true, e
			)),
	]);


	if (fetchR2Subreddit) {
		if (gqlOrR2SubredditInfo instanceof RedditAPIError) {
			throw {
				jsonResponse: JSON.stringify({
					reason: gqlOrR2SubredditInfo.status === 404
						? "NOT_FOUND"
						: gqlOrR2SubredditInfo.reason.toUpperCase(),
					data: {},
				}),
				status: gqlOrR2SubredditInfo.status,
			}
		} else if (gqlOrR2SubredditInfo.kind === "t5") {
			subredditNameToId[gqlOrR2SubredditInfo.data.display_name.toLowerCase()] = gqlOrR2SubredditInfo.data.name;
		} else throw gqlOrR2SubredditInfo;

	} else {
		const subredditInfoByName = gqlOrR2SubredditInfo?.subredditInfoByName;
		
		if (!subredditInfoByName || subredditInfoByName.__typename !== "Subreddit") {
			const gatewayError = await convertUnavailableGqlSubredditToGatewayError(subredditInfoByName);
			logger.dbg("Unavailable gql subreddit", { subredditInfoByName, gatewayError });
			throw gatewayError;
		}

		subredditNameToId[subredditName.toLowerCase()] = subredditInfoByName.id;
	}

	return {
		structuredStyles,
		postFlairsV2,
		userFlairsV2,
		subredditInfo: fetchR2Subreddit ? gqlOrR2SubredditInfo.data : gqlOrR2SubredditInfo.subredditInfoByName,
		isSubredditR2: fetchR2Subreddit,
	};
}


export const shouldUseArcticShiftHistory = async (username: string) => {
	if (username === getState().user.account?.displayText.toLowerCase()) return false;
	if (isUserCurationActive.has(username)) return isUserCurationActive.get(username);

	const { redditorInfoByName } = await gqlFetch("UserProfile", "27ec8d5c561882fab3f0b1da7a20ca742db928e4f2e5e943ac3a827965d5ff4e", {
		name: username,
		includePremiumAvatarTreatment: false,
	}, { cache: true, maxCacheAge: 60e3 });

	return redditorInfoByName?.isProfileContentFiltered;
}