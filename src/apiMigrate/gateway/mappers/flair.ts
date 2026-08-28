import type { Flair } from "../types/flair";

export const reduceFlairsV2R2 = (flairsV2: any[]) => {
	const templates: Record<string, any> = {};
	const templateIds: string[] = [];
	for (const postFlair of flairsV2) {
		templates[postFlair.id] = {
			id: postFlair.id,
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


export const processSubredditPostFlair = (data: any, postFlairsV2?: any[]) => ({
	displaySettings: { isEnabled: data.link_flair_enabled, position: data.link_flair_position ?? "right" },
	permissions: { canAssignOwn: data.can_assign_link_flair ?? true },
	...(postFlairsV2?.length && reduceFlairsV2R2(postFlairsV2)),
});

export const processSubredditPostFlairGql = (data: any, postFlairsV2?: any[]) => ({
	displaySettings: { isEnabled: data.postFlairSettings?.isEnabled ?? true, position: "right" },
	permissions: { canAssignOwn: Boolean(postFlairsV2) },
	...(postFlairsV2?.length && reduceFlairsV2R2(postFlairsV2)),
});


export const processSubredditUserFlair = (data: any, userFlairsV2?: any[]) => ({
	// very confusing
	displaySettings: {
		isUserEnabled: data.user_sr_flair_enabled,
		isEnabled: data.user_flair_enabled_in_sr,
		position: data.user_flair_position ?? "right",
	},
	permissions: { canUserChange: data.user_can_flair_in_sr, canAssignOwn: data.can_assign_user_flair },
	applied: data.user_flair_text ? {
		text: data.user_flair_text,
		richtext: data.user_flair_richtext,
		backgroundColor: data.user_flair_background_color,
		templateId: data.user_flair_template_id,
		textColor: data.user_flair_text_color,
		type: data.user_flair_type,
	} : null,
	...(userFlairsV2?.length && reduceFlairsV2R2(userFlairsV2)),
});

export const processSubredditUserFlairGql = ({ authorFlairSettings, modPermissions, authorFlair }: any, userFlairsV2?: any[]) => ({
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
				type: authorFlair.template.richtext ? "richtext" : "text",
			}
		: null,
	...(userFlairsV2?.length && reduceFlairsV2R2(userFlairsV2))
});


export const getAuthorFlairFromR2Thing = (data: any): Flair | null =>
	data.author_flair_text
		? {
			text: data.author_flair_text,
			richtext: data.author_flair_richtext,
			backgroundColor: data.author_flair_background_color,
			templateId: data.author_flair_template_id,
			textColor: data.author_flair_text_color,
			type: data.author_flair_type,
			cssClass: data.author_flair_css_class,
		} : null;