import type { AuthorCommunityBadgeFragmentFragment, AuthorFlairFragmentFragment } from "../../../../api/types/gql";
import type { Flair } from "../../types/flair";

export function getAuthorFlairFromGqlThing(
	data: AuthorFlairFragmentFragment,
	achievementFlair?: AuthorCommunityBadgeFragmentFragment['authorCommunityBadge'] | undefined
): Flair | null {

	let rtjson = data?.richtext ? JSON.parse(data.richtext) : null;
	const acheivementRtjson = achievementFlair
		? [
			{ e: "emoji", u: achievementFlair.image.url, a: achievementFlair.accessibilityLabel },
			{ e: "text", t: " "+achievementFlair.label }
		] : [];

	if (rtjson && achievementFlair) {
		rtjson.push({ e: "text", t: " │ " }, ...acheivementRtjson);
	} else {
		rtjson = acheivementRtjson;
	}

	if (!data) {
		if (achievementFlair) {
			return {
				text: achievementFlair.label,
				richtext: rtjson,
				backgroundColor: '#222',
				templateId: '',
				textColor: "light",
				type: "richtext",
				cssClass: null,
			}
		} else return null;
	}
	return {
		text: data.text,
		richtext: rtjson,
		backgroundColor: data.template.backgroundColor,
		templateId: data.template.id,
		textColor: data.textColor as any,
		type: data.richtext ? 'richtext' : 'text',
		cssClass: undefined as any,
	};
}