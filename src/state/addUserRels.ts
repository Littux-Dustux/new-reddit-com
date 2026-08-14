import { gqlFetch } from "../api/gql";
import { getREST } from "../api/rest";
import type { State } from "../main";


export default async function(state: State) {
	const [{ data: { children: blockedRels }}, { identity }] = await Promise.all([
		getREST("/prefs/blocked.json?raw_json=1&include_icon_img=1").catch(() => ({ data: { children: [] }})),
		gqlFetch("GetWhitelistedUsers", "4f4ab343aba3403411bf46f169a3374461bd585d227330ce04605f92a4d8eb29", {}),
	]);

	if (!identity) return;

	state.user.blocked.data = blockedRels;
	state.user.whitelist.data = identity.allowlistedRedditorsInfo.edges.map(({ node }: any) => ({
		date: 0,
		icon_img: node.profile?.styles?.icon,
		id: node.id,
		name: node.displayName?.slice(2) ?? '[deleted]'
	}));
}