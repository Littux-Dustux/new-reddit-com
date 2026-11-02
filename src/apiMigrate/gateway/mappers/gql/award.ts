import type { AwardingTotalFragment2024Fragment } from "../../../../api/types/gql";
import type { Award } from "../../types/award";

interface AwardData {
	allAwardings: Award[],
	awardCountsById: Record<string, number>,
}

export function processAwards(awardingTotals: AwardingTotalFragment2024Fragment[]): AwardData {
	const data: AwardData = {
		allAwardings: [],
		awardCountsById: {}
	}
	for (const { total, award } of awardingTotals) {
		data.awardCountsById[award.id] = total;
		data.allAwardings.push({
			awardSubType: "GLOBAL",
			awardType: "GLOBAL",
			coinPrice: 0,
			coinReward: 0,
			count: total,
			daysOfDripExtension: 0,
			daysOfPremium: 0,
			description: '',
			iconUrl: award.static_icon_64.url,
			icon32: award.static_icon_32.url,
			icon64: award.static_icon_64.url,
			icon128: award.static_icon_64.url,
			id: award.id,
			isEnabled: true,
			isNew: false,
			name: award.name,
			staticIcon: award.static_icon_64.url,
			staticIcon32: award.static_icon_32.url,
			staticIcon64: award.static_icon_64.url,
			staticIcon128: award.static_icon_64.url,
			subredditCoinReward: 0,
			tags: [],
			tiers: null,
		})
	}
	return data;
}