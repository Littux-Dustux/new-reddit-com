export type Flair = {
	textColor: "light" | "dark";
	backgroundColor: string;
	cssClass: string | null;
	templateId: string | null;
} & (
	{ type: "richtext", richtext: any[] } |
	{ type: "text", text: string }
);

export type PostFlair =
	Flair |
	{ type: "spoiler", text: "spoiler" } |
	{ type: "nsfw", text: "nsfw" } |
	{ type: "quarantined", text: "quarantined" };