import { addGqlSubredditToState, processModPermissionsGql, subredditNameToId } from "../apiMigrate/gateway/mappers/subreddit";
import { getState } from "../main";

export function addModSubToState(sub: any) {
	const state = getState();
	const id = sub.id;
	subredditNameToId[sub.name.toLowerCase()] = id;

	if (sub.modPermissions) {
		state.subreddits.moderated.order.push(id);
		(state.moderatingSubreddits as any)[id] = processModPermissionsGql(sub);
	}

	addGqlSubredditToState({
		postFlair: state.postFlair,
		subredditAboutInfo: state.subreddits.about,
		subreddits: state.subreddits.models,
		subredditPermissions: {},
		userFlair: state.features.userFlair,
	}, sub);

	return sub;
}