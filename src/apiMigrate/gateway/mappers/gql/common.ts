import type { MediaAssetR2 } from "../../types/common";
import type { MediaSourceFragmentFragment, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost_crosspostRoot_CrosspostRoot_post_Post_content_Content_richtextMedia as RichtextMedia, PostCommentsQuery_postInfoById_PostInfo_commentForest_CommentForest_trees_CommentTree_node_Comment_content_Content_richtextMedia_AnimatedImageAsset as anim } from "../../../../api/types/gql";

export const convertSingleGqlMediaAsset = (asset: RichtextMedia): MediaAssetR2 => {
	switch (asset.__typename) {
		case "VideoAsset":
			return {
				e: "RedditVideo",
				status: "valid",
				dashUrl: asset.dashUrl,
				hlsUrl: asset.hlsUrl,
				id: asset.id,
				x: asset.width,
				y: asset.height,
			}
		case "ImageAsset":
			const bestAsset = getLargestImage(asset) ?? {
				url: asset.url,
				dimensions: {
					width: asset.width,
					height: asset.height
				}
			}
			return asset.status === "VALID"
				? {
					e: "Image",
					status: "valid",
					id: asset.id,
					...(asset.obfuscated_small && {
						o: [{
							u: asset.obfuscated_small.url,
							x: asset.obfuscated_small.dimensions.width,
							y: asset.obfuscated_small.dimensions.height,
						}],
					}),
					s: {
						u: bestAsset.url,
						x: bestAsset.dimensions.width,
						y: bestAsset.dimensions.height,
					},
				}
				: getUnavailableMediaAsset(asset.id, asset.status)
		case "AnimatedImageAsset":
			return asset.status === "VALID"
				? {
					e: "AnimatedImage",
					status: "valid",
					id: asset.id,
					m: asset.mimetype,
					s: {
						x: asset.width,
						y: asset.height,
						gif: asset.url,
						// @ts-ignore
						mp4: asset.mp4Url,
					},
					p: convertGqlMediaAssetRes(asset),
				}
				: getUnavailableMediaAsset(asset.id, asset.status)
		default:
			return getUnavailableMediaAsset(asset.id, "INVALID");
	}
}

export function convertGqlMediaAssets(gqlAssets: RichtextMedia[]): Record<string, MediaAssetR2> {
	const convertedAssets: Record<string, MediaAssetR2> = {};

	for (const asset of gqlAssets)
		convertedAssets[asset.id] = convertSingleGqlMediaAsset(asset);

	return convertedAssets;
}

function getUnavailableMediaAsset(
	id: string,
	status: "FAILED" | "INVALID" | "UNPROCESSED",
): MediaAssetR2 {
	switch (status) {
		case "FAILED":
			return { status: "failed", id };
		case "INVALID":
			return { status: "invalid", id };
		case "UNPROCESSED":
			return { status: "unprocessed", id };
	}
}


const res = ["small", "medium", "large", "xlarge", "xxlarge", "xxxlarge"];
const resRev = res.toReversed();

export function convertGqlResolutions(source: Record<string, any>, prefix: string = '') {
	const resolutions: { url: string, width: number, height: number }[] = [];
	for (const q of res) {
		const msource: MediaSourceFragmentFragment | undefined = source[prefix + q];
		if (msource) {
			resolutions.push({
				url: msource.url,
				...msource.dimensions
			})
		}
	}
	return resolutions;
}

function convertGqlMediaAssetRes(source: Record<string, any>, prefix: string = '') {
	const resolutions: { u: string, x: number, y: number }[] = [];
	for (const q of res) {
		const msource: MediaSourceFragmentFragment | undefined = source[prefix + q];
		if (msource) {
			resolutions.push({
				u: msource.url,
				x: msource.dimensions.width,
				y: msource.dimensions.height,
			})
		}
	}
	return resolutions;
}

function getLargestImage(source: Record<string, any>, prefix: string = '') {
	for (const q of resRev) {
		const msource: MediaSourceFragmentFragment | undefined = source[prefix + q];
		if (msource) {
			return msource;
		}
	}
}