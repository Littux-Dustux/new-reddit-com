export const fixFlair = (flair: any) => {
	flair.backgroundColor = flair.template.backgroundColor;
	flair.cssClass = null;
	flair.type ??= flair.richtext ? 'richtext' : 'text';
	Object.assign(flair.template, {
		cssClass: null,
		type: flair.type ?? 'text',
		text: flair.text,
		richtext: flair.richtext,
		textColor: flair.textColor,
	})
}