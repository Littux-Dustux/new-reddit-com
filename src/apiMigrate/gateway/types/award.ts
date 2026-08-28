type AwardType = 'GLOBAL' | 'MODERATOR' | 'COMMUNITY';
type AwardSubType = 'GLOBAL' | 'MODERATOR' | 'COMMUNITY' | 'APPRECIATION' | 'PREMIUM' | 'GROUP' | 'CHAT_REACTION';
type MediaUrl = { url: string };

export interface Award {
	awardType: AwardType,
	awardSubType: AwardSubType,
	coinPrice: number,
	coinReward: number,
	daysOfDripExtension: number,
	daysOfPremium: number,
	description: string,
	id: string,
	isEnabled: boolean,
	isNew: boolean,
	name: string,
	icon: MediaUrl,
	icon32: MediaUrl,
	icon64: MediaUrl,
	icon128: MediaUrl,
	staticIcon: MediaUrl,
	staticIcon32: MediaUrl,
	staticIcon64: MediaUrl,
	staticIcon128: MediaUrl,
	subredditCoinReward: number,
	tags: string[],
	tiers: null
}