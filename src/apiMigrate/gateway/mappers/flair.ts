export const reduceFlairsV2R2 = (flairsV2: any[]) => {
	const templates: Record<string, any> = {};
	const templateIds: string[] = [];
	for (const postFlair of flairsV2) {
		templates[postFlair.id] = {
			allowableContent: postFlair.allowable_content,
			backgroundColor: postFlair.background_color,
			cssClass: postFlair.css_class,
			maxEmojis: postFlair.max_emojis,
			modOnly: postFlair.mod_only,
			richtext: postFlair.richtext,
			templateId: postFlair.id,
			text: postFlair.text,
			textColor: postFlair.text_color,
			textEditable: postFlair.text_editable,
			type: postFlair.type
		};
		templateIds.push(postFlair.id);
	};
	return { templates, templateIds }
}


export const processSubredditPostFlair = (data: any) => ({
	displaySettings: { isEnabled: data.link_flair_enabled, position: data.link_flair_position },
	permissions: { canAssignOwn: true },
	//templates: {},
	//templateIds: [],
});

export const processSubredditPostFlairGql = (data: any, postFlairsV2: any[]) => ({
	displaySettings: { isEnabled: data.postFlairSettings.isEnabled, position: "right" },
	permissions: { canAssignOwn: true },
	...(postFlairsV2 && reduceFlairsV2R2(postFlairsV2)),
});


export const processSubredditUserFlair = (data: any) => ({
	displaySettings: { isUserEnabled: false, isEnabled: true, position: "right" },
	permissions: { canUserChange: false, canAssignOwn: false },
	applied: null,
	templates: {},
	templateIds: [],
});

export const processSubredditUserFlairGql = ({ authorFlairSettings, modPermissions, authorFlair }: any, userFlairsV2: any[]) => ({
	displaySettings: { isEnabled: authorFlairSettings.isEnabled, isUserEnabled: authorFlairSettings.isOwnFlairEnabled, position: "right" },
	permissions: {
		canUserChange: authorFlairSettings.isSelfAssignable,
		canAssignOwn:
			authorFlairSettings.isSelfAssignable || (modPermissions && (modPermissions.isAllAllowed || modPermissions.isFlairEditingAllowed)),
	},
	applied: authorFlair?.template
		? {
				text: authorFlair.template.text,
				richtext: authorFlair.template.richtext ? JSON.parse(authorFlair.template.richtext) : [],
				backgroundColor: authorFlair.template.backgroundColor,
				templateId: authorFlair.template.id,
				textColor: authorFlair.template.textColor,
				type: authorFlair.template.richtext?.length ? "richtext" : "text",
			}
		: null,
	...(userFlairsV2 && reduceFlairsV2R2(userFlairsV2))
});


export const getAuthorFlairFromR2Thing = (data: any) =>
	data.author_flair_text
		? {
			text: data.author_flair_text,
			richtext: data.author_flair_richtext,
			backgroundColor: data.author_flair_background_color,
			templateId: data.author_flair_template_id,
			textColor: data.author_flair_text_color,
			type: data.author_flair_type,
		} : null;