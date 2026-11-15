import type { MediaAssetR2 } from "../../types/common";
import type { MediaSourceFragmentFragment, SubredditFeedElementsQuery_postFeed_Subreddit_elements_SearchPostsConnection_edges_PostInfoEdge_node_AdPost_crosspostRoot_CrosspostRoot_post_Post_content_Content_richtextMedia as RichtextMedia, PostCommentsQuery_postInfoById_PostInfo_commentForest_CommentForest_trees_CommentTree_node_Comment_content_Content_richtextMedia_AnimatedImageAsset as anim } from "../../../../api/types/gql";
import { MediaQuality, clientConfig } from "../../../../ui/settings";

export const convertSingleGqlMediaAsset = (asset: RichtextMedia, isPost: boolean): MediaAssetR2 => {
	switch (asset.__typename) {
		case "VideoAsset":
			return {
				e: "RedditVideo",
				status: "valid",
				dashUrl: asset.dashUrl.replace('cf.v', 'v'),
				hlsUrl: asset.hlsUrl.replace('cf.v', 'v'),
				id: asset.id,
				x: asset.width,
				y: asset.height,
			}
		case "ImageAsset":
			/* const bestAsset = getLargestImage(asset, '', (isPost ? resPreferenceIndex : null) ?? 3) ?? {
				url: asset.url,
				dimensions: {
					width: asset.width,
					height: asset.height
				}
			} */
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
						u: asset.url,
						x: asset.width,
						y: asset.height,
					},
					p: convertGqlMediaAssetRes(asset, '', isPost),
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
						// @ts-ignore
						gif: asset.mp4Url ? `mp4:${asset.mp4Url}|${asset.medium?.url}` : asset.url,
						// @ts-ignore
						mp4: asset.mp4Url,
					},
					p: convertGqlMediaAssetRes(asset, '', isPost),
				}
				: getUnavailableMediaAsset(asset.id, asset.status)
		default:
			return getUnavailableMediaAsset(asset.id, "INVALID");
	}
}

export function convertGqlMediaAssets(gqlAssets: RichtextMedia[], isPost: boolean): Record<string, MediaAssetR2> {
	const convertedAssets: Record<string, MediaAssetR2> = {};
	if (!Array.isArray(gqlAssets)) return convertedAssets;

	for (const asset of gqlAssets)
		convertedAssets[asset.id] = convertSingleGqlMediaAsset(asset, isPost);

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


export const res = ["source", "xxxlarge", "xxlarge", "xlarge", "large", "medium", "small"];
const resPreferenceIndex = ({
	[MediaQuality.Small]: 6,
	[MediaQuality.Medium]: 5,
	[MediaQuality.Large]: 4,
	[MediaQuality.XLarge]: 3,
	[MediaQuality.XXLarge]: 2,
	[MediaQuality.XXXLarge]: 1,
	[MediaQuality.Source]: 0,
	[MediaQuality.SourceNoWebP]: 0,
} as Record<MediaQuality, number>)[clientConfig.forcePostImgWidth];


export function convertGqlResolutions(source: Record<string, any>, prefix: string = '') {
	if (resPreferenceIndex !== undefined) {
		const preferred = getLargestImage(source, prefix, resPreferenceIndex);
		if (preferred) {
			return [{
				url: clientConfig.forcePostImgWidth === MediaQuality.SourceNoWebP
					? getOriginalUncompressedUrl(preferred.url)
					: preferred.url,
				...preferred.dimensions
			}]
		}
	}

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

function convertGqlMediaAssetRes(source: Record<string, any>, prefix: string = '', checkPreferred: boolean = true) {
	if (checkPreferred && resPreferenceIndex !== undefined) {
		const preferred = getLargestImage(source, prefix, resPreferenceIndex);
		if (preferred) {
			return [{
				u: clientConfig.forcePostImgWidth === MediaQuality.SourceNoWebP
					? getOriginalUncompressedUrl(preferred.url)
					: preferred.url,
				x: preferred.dimensions.width,
				y: preferred.dimensions.height,
			}]
		}
	}

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
	if (resolutions.length === 0) resolutions.push({
		u: source.url,
		x: source.width,
		y: source.height,
	});
	return resolutions;
}


export function getLargestImage(source: Record<string, any>, prefix: string = '', startIndex = resPreferenceIndex) {
	for (let i = startIndex; i < res.length; i++) {
		const q = res[i] as string;
		const msource: MediaSourceFragmentFragment | undefined = source[prefix + q];
		if (msource) {
			return msource;
		}
	}
}

export function getOriginalUncompressedUrl(originalUrl: string) {
	if (originalUrl.includes("preview.redd.it")) {
		const url = new URL(originalUrl);
		url.search = '';
		url.host = 'i.redd.it';
		return url.toString();
	} else {
		return originalUrl;
	}
}