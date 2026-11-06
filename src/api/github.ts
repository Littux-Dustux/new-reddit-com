import { REPO_API_PATH, REPO_PATH, VERSION } from "../constants";
import { clearToast, showToast, ToastType } from "../logging";
import { compareVersions } from "../utils";
import { restartServer, triggerClientUpdate } from "./localhost";
import { getREST } from "./rest";


const fetchGh = (url: string, payload?: any) =>
	fetch(`${REPO_API_PATH}${url}`, {
		method: payload ? "POST" : "GET",
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'Littux-Dustux/new-reddit-com Update Checker',
		},
		body: payload ? JSON.stringify(payload) : undefined,
	})
	.then(res => res.json())
	.catch(() => {});



export async function checkForUpdates() {
	const tagsResponse = await fetchGh('/tags?per_page=100');

	if (!tagsResponse || !Array.isArray(tagsResponse)) return;

	const newUpdates: string[] = [];
	for (const { name } of tagsResponse) {
		if (compareVersions(name, VERSION) > 0) {
			newUpdates.push(name);
		}
	}

	if (newUpdates.length) {
		showToast({
			id: 'updatePopUp',
			kind: ToastType.Modal,
			text: newUpdates.length === 1
				? 'A new update is available!'
				: `${newUpdates.length} new updates are available!`,
			buttonText: 'Update',
			buttonAction: () => doUpdate(`${REPO_API_PATH}/releases?per_page=1`),
			secondButtonText: 'Cancel',
			secondButtonAction: () => clearToast('updateChangelog'),
		}, 0);
		showToast({
			id: 'updateChangelog',
			kind: ToastType.Custom,
			text: `What has changed since ${VERSION}`,
			buttonText: 'See Changelog',
			buttonAction: () => seeChangeLog(newUpdates),
		}, 0)
	}
}



async function seeChangeLog(newUpdates: string[]) {
	if (newUpdates.length === 1) {
		const annPost = await getREST(
			`/api/info?url=${REPO_PATH}/releases/tag/${newUpdates[0] as string}&limit=100`,
			{ cookieAuth: true }
		);

		for (const { post } of annPost.data.children) {
			// r/Littux
			if (post.subreddit_id === "t5_efsaqc") {
				return window.store.dispatch({
					type: "@@router/CALL_HISTORY_METHOD",
					payload: {
						method: "push",
						args: [post.permalink]
					}
				});
			};
		}
	}

	const a = document.createElement('a');
	a.href = 'https://github.com/Littux-Dustux/new-reddit-com/releases/';
	a.target = '_blank';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}



async function doUpdate(url: string) {
	showToast({
		id: 'updateProgress',
		kind: ToastType.Custom,
		text: 'Updating, this will take a while... (meanwhile you can continue browsing)',
	}, 0);

	const { newVersion } = await triggerClientUpdate({ releasesUrl: url, currentVersion: VERSION });
	await restartServer();

	clearToast('updateProgress');
	showToast({
		id: 'updateSuccess',
		kind: ToastType.SuccessCommunity,
		text: `Update to ${newVersion} successful!`,
		buttonText: "Refresh Page",
		buttonAction: () => window.location.reload(),
	}, 0);
}