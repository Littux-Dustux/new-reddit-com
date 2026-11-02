const levels: [string, string][] = [
	['compactPreview', 'small'],
	['mediumPreview', 'medium'],
	['largePreview', 'large'],
	['extraLargePreview', 'xxxlarge'],
	['preview', 'source'],
	['obfuscatedPreview', 'originalObfuscated'],
	['obfuscated', 'largeObfuscated']
];

const unusedLevels = ['xlarge', 'xxlarge']

export function convertShredditMediaRes(media: Record<string, any>, prefix = '') {
	unusedLevels.forEach(l => media[prefix + l] = null);
	for (const [orig, newName] of levels) {
		media[prefix + newName] = media[orig];
		delete media[orig];
	}
	return media;
}