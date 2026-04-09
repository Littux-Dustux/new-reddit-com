import { gqlFetch } from "../../api/gql";

const modNoteCountKeyMap = {
	all: "ALL",
	approval: "APPROVAL",
	ban: "BAN",
	contentChange: "CONTENT_CHANGE",
	invite: "INVITE",
	modAction: "MOD_ACTION",
	mute: "MUTE",
	note: "NOTE",
	removal: "REMOVAL",
	spam: "SPAM",
};

export default async function (variables: any) {
	if (!variables.userId) return '{"data":{"subredditInfoById":{}}}';
	let { subredditInfoById } = await gqlFetch("GetModUserLogsCounts", "0b218eeab977b9178243552e831592d20ea1c59e72327867182faff65d1deba6", variables);
	delete subredditInfoById["__typename"];

	subredditInfoById = Object.fromEntries(Object.entries(subredditInfoById).map(([k, v]) => [modNoteCountKeyMap[k], v]));
	return JSON.stringify({ data: { subredditInfoById } });
}