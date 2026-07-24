const awardIconSizes =  [ 32, 48, 64, 128 ];

export function fixAwardIconSize(award: any) {

	for (const size of awardIconSizes) {
		award[`icon${size}`] = award[`icon_${size}`];
		delete award[`icon_${size}`];

		award[`staticIcon${size}`] = award[`static_icon_${size}`];
		delete award[`static_icon_${size}`];
	};
	return award;
}

export function fixAwardings(awardings: any) {
	for (const { award } of awardings) {
		award.awardType = "GLOBAL";
		award.awardSubType = "GLOBAL";
		award.icon = award.icon_256;
		award.staticIcon = award.static_icon_256;
		fixAwardIconSize(award);
	}
}