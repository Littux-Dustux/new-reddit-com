import { getLogger } from "../../logging";
import { getGIPHYGifsByIds } from "../../api/giphy";
import { gqlFetch } from "../../api/gql";
import { getVideoMediaMetadataGql, getMuxedMP4sDownloadRTJSON } from "./mappers/common";

const logger = getLogger('apiMigrate:gateway:utils');

export async function fixR2CommentsMedia(comments: Record<string, any>) {
	// some giphy comments don't have the proper metadata, and have {"status":"invalid"}. So we'll fetch it from GIPHY.
	const brokenGiphyCommentMediaMetadatas: Record<string, any[]> = {};
	const giphyIdsToFetch: Set<string> = new Set();

	// reddit doesn't include videos in comments on the old API
	const videoCommentIncompleteMedias: Record<string, any> = {};
	const videoCommentIdsToFetch: string[] = [];

	for (const comment of Object.values(comments)) {
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

	if (giphyIdsToFetch.size > 0)
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

	if (videoCommentIdsToFetch.length > 0)
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
			})
		);

	await Promise.all(commentFixerPromises);
	return comments;
}