import { getLogger } from "../../logging";
import { getGIPHYGifsByIds } from "../../api/giphy";
import { gqlFetch } from "../../api/gql";
import { getVideoMediaMetadataGql, getMuxedMP4sDownloadRTJSON } from "./mappers/common";
import { getREST } from "../../api/rest";
import { convertUnavailableSubredditToGatewayError, subredditNameToId } from "./mappers/subreddit";
import { getState } from "../../main";
import { markdownToRichText } from "./mappers/richtext";
import { FormattingFlag } from "./mappers/richtext_types";

const logger = getLogger('apiMigrate:gateway:utils');

export async function fixR2CommentsMedia(comments: Record<string, any>) {
	// some giphy comments don't have the proper metadata, and have {"status":"invalid"}. So we'll fetch it from GIPHY.
	const brokenGiphyCommentMediaMetadatas: Record<string, any[]> = {};
	const giphyIdsToFetch: Set<string> = new Set();

	// reddit doesn't include videos in comments on the old API
	const videoCommentIncompleteMedias: Record<string, any> = {};
	const videoCommentIdsToFetch: string[] = [];

	// to get blocked user comments from arctic-shift
	const arcticShiftRefetchIds: string[] = [];

	for (const comment of Object.values(comments)) {
		if (comment.unrepliableReason === "NEAR_BLOCKER") {
			arcticShiftRefetchIds.push(comment.id);
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

	if (giphyIdsToFetch.size > 0) commentFixerPromises.push(
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

	if (videoCommentIdsToFetch.length > 0) commentFixerPromises.push(
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

	if (arcticShiftRefetchIds.length > 0) commentFixerPromises.push(
		fetch(`https://arctic-shift.photon-reddit.com/api/comments/ids?ids=${arcticShiftRefetchIds.join(",")}&fields=id,retrieved_on,author,author_fullname,body`)
		.then(resp => resp.json())
		.then(({ data, error }) => {
			if (error) throw { message: error };
			for (const { id, retrieved_on, author, author_fullname, body } of data) {
				const comment = comments[`t1_${id}`];
				comment.author = author;
				comment.authorId = author_fullname;
				const retrievedText = `Retrieved by arctic-shift on ${new Date(retrieved_on * 1000).toLocaleString()} (why: u/${author} blocked you)`;
				comment.media.richtextContent = {
					document: markdownToRichText(body, comment.media.mediaMetadata).document.concat([
						{ e: "hr" }, { e: "par", c: [{ e: "text", t: retrievedText, f: [[FormattingFlag.italic, 0, retrievedText.length]] }] }
					])
				}
			}
		}).catch(e => {
			logger.err("Error fetching arctic-shift comments data: " + (e as any).message);
		})
	);

	await Promise.all(commentFixerPromises);
	return comments;
}


export async function fetchSubredditPageExtra(
	subredditName: string | null | undefined,
	includeStructuredStyles: boolean = true,
): Promise<{ structuredStyles: any, gqlSubredditInfo: any, postFlairsV2: any, userFlairsV2: any }> {

	if (!subredditName) return {
		structuredStyles: null,
		gqlSubredditInfo: null,
		postFlairsV2: null,
		userFlairsV2: null,
	}

	if (!includeStructuredStyles) {
		const id = subredditNameToId[subredditName.toLowerCase()];
		if (id) {
			return {
				structuredStyles: null,
				gqlSubredditInfo: { __typename: "__USE_CACHE__", id, name: subredditName },
				userFlairsV2: null,
				postFlairsV2: null,
			}
		}
	}

	let includeUserFlairs = true, includePostFlairs = true;
	const id = subredditNameToId[subredditName.toLocaleLowerCase()];
	if (id) {
		includeUserFlairs = (getState().features.userFlair as any)[id]?.permissions.canAssignOwn;
		includePostFlairs = (getState().postFlair as any)[id]?.displaySettings.isEnabled;
	}

	const [structuredStyles, postFlairsV2, userFlairsV2, gqlSubredditInfo] = await Promise.all([
		includeStructuredStyles && getREST(`/api/v1/structured_styles/${subredditName}.json?raw_json=1`)
		.catch(e => logger.err(`Error fetching structuredStyles for r/${subredditName}: ${e.message}`, true, e)),

		includePostFlairs && getREST(`/r/${subredditName}/api/link_flair_v2.json?raw_json=1`)
		.catch(e => logger.err(`Error fetching post flairs for r/${subredditName}: ${e.message}`, true, e)),

		includeUserFlairs && getREST(`/r/${subredditName}/api/user_flair_v2.json?raw_json=1`)
		.catch(e => logger.err(`Error fetching user flairs for r/${subredditName}: ${e.message}`, true, e)),

		gqlFetch(
			"SubredditInfoByName",
			"6b9c1679e69097e1c6df364adc11183afe6e2b6545dd1c0c1cc8f7490448c3e5",
			{
				subredditName,
				loggedOutIsOptedIn: true,
				filterGated: true,
				includeRecapFields: false,
				includeWelcomePage: false,
				includeDevvitData: false,
			}
		)
		.catch(e => logger.err(`Error fetching gql subreddit info for r/${subredditName}: ${e.message}`, true, e)),
	]);


	const subredditInfoByName = gqlSubredditInfo?.subredditInfoByName;
	subredditNameToId[subredditName.toLowerCase()] = subredditInfoByName?.id;

	if (!subredditInfoByName || subredditInfoByName.__typename !== "Subreddit") {
		const gatewayError = await convertUnavailableSubredditToGatewayError(subredditInfoByName);
		logger.dbg("Unavailable subreddit", { subredditInfoByName, gatewayError });
		throw gatewayError;
	}

	return {
		structuredStyles,
		postFlairsV2,
		userFlairsV2,
		gqlSubredditInfo: subredditInfoByName,
	};
}