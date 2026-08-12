import { gqlFetch } from "../api/gql";
import { getLogger } from "../logging";

type StateLoid = { loid: string, loidCreated: string, version: number, blob: string };

export const getLoidState = (loidString?: string) => {
	const [loid, version, loidCreated, blob] = (loidString ?? window.loid).split(".");
	return {
		loid,
		loidCreated,
		version: Number(version),
		blob
	} as StateLoid;
}

export const convertStateLoidToString = (loidState: StateLoid): string =>
	`${loidState.loid}.${loidState.version}.${loidState.loidCreated}.${loidState.blob}`;


const logger = getLogger("state:utils");
const redditDomains = new Set(['reddit.com', 'www.reddit.com', 'old.reddit.com', 'new.reddit.com', 'np.reddit.com', /* window.location.host */ ]);

document.addEventListener('click', async (e: any) => {
	const anchor = e.target?.closest('a');
	if (!anchor || !anchor.href) return;

	const url = new URL(anchor.href);

	if (anchor.classList.contains("_3t5uN8xUmg0TOwRCOGQEcU") || (redditDomains.has(url.host) && (url.pathname.includes("/s/") || url.pathname.includes("/comments/")))) {
		e.preventDefault();

		let fullPath;

		if (url.hostname === "redd.it") {
			fullPath = "/comments" + url.pathname;
		} else if (url.pathname.includes("/s/")) {
			fullPath = new URL((await gqlFetch(
				"ShareUrl", "424a761fb3d80ef2ec18a7dfaa867a9a1acf44df218e526c4538850dc7415c86", { shortUrl: url.toString() }
			)).shareUrl.url).pathname;
		} else {
			fullPath = url.pathname + url.search + url.hash
		}

		logger.log(`Redirecting link to internal route: ${fullPath}`);
		window.store.dispatch({
			type: "@@router/CALL_HISTORY_METHOD",
			payload: {
				method: "push",
				args: [fullPath]
			}
		});

		// Tell React to re-render the view
		// window.dispatchEvent(new PopStateEvent('popstate'));
	}
}, true);