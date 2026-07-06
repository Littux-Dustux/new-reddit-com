const awardIconSizes =  [ 32, 48, 64, 128 ];

export function fixAwardIconSize(award: any) {
	for (const size of awardIconSizes) {
		award[`icon${size}`] = award[`icon_${size}`];
		delete award[`icon_${size}`];
	};
	return award;
}