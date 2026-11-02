import type { AuthorFlairFragmentFragment } from "../../../../api/types/gql";
import type { Flair } from "../../types/flair";

export const getAuthorFlairFromGqlThing = (data: AuthorFlairFragmentFragment): Flair | null =>
	data
		? {
			text: data.text,
			richtext: data.richtext ? JSON.parse(data.richtext) : undefined,
			backgroundColor: data.template.backgroundColor,
			templateId: data.template.id,
			textColor: data.textColor as any,
			type: data.richtext ? 'richtext' : 'text',
			cssClass: undefined as any,
		} : null;