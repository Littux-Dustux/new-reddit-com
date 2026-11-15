import { clientConfig, MediaQuality } from "../../../ui/settings";
import { getOriginalUncompressedUrl } from "../../gateway/mappers/gql/common";


const levels: [string, string][] = [
	['preview', 'source'],
	['extraLargePreview', 'xxxlarge'],
	['largePreview', 'large'],
	['mediumPreview', 'medium'],
	['compactPreview', 'small'],
	['obfuscatedPreview', 'originalObfuscated'],
	['obfuscated', 'largeObfuscated']
];

const preferredQualityIndex = ({
	[MediaQuality.Small]: 2,
	[MediaQuality.Medium]: 2,
	[MediaQuality.Large]: 2,
	[MediaQuality.XLarge]: 2,
	[MediaQuality.XXLarge]: 1,
	[MediaQuality.XXXLarge]: 1,
	[MediaQuality.Source]: 0,
	[MediaQuality.SourceNoWebP]: 0,
} as Record<MediaQuality, number>)[clientConfig.forcePostImgWidth];


export function convertShredditMediaRes(media: Record<string, any>, prefix = '') {
	if (preferredQualityIndex !== undefined) {
		media[prefix + 'source'] = media.preview;
		if (clientConfig.forcePostImgWidth === MediaQuality.SourceNoWebP) {
			levels.forEach(([orig]) => delete media[orig]);
		} else if (clientConfig.forcePostImgWidth === MediaQuality.Source) {
			media[prefix + 'xlarge'] = media.preview;
			if (media.__typename === "ImageAsset") {
				media.url = media.preview.url;
			}
			levels.forEach(([orig]) => delete media[orig]);

		} else {
			let preferredNotFound = true;
			for (let i = 0; i < levels.length; i++) {
				const [orig, newName] = levels[i] as [string, string];
				if (media[orig]) {
					if (preferredNotFound && i >= preferredQualityIndex) {
						media[prefix + newName] = media[orig];
						if (media.__typename === "ImageAsset") {
							media.url = media[orig].url;
							Object.assign(media, media[orig].dimensions);
						}
						preferredNotFound = false;
						break;

					} else if (i > 4) {
						// Obfuscated images
						media[prefix + newName] = media[orig];
					}
				}
				delete media[orig];
			}
		}
		return media;
	}

	for (const [orig, newName] of levels) {
		media[prefix + newName] = media[orig];
		delete media[orig];
	}
	return media;
}