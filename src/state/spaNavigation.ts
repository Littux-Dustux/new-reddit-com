import { gqlFetch } from "../api/gql";
import { getLogger, showToast, ToastType } from "../logging";

const logger = getLogger("state:spaNavigation");
const redditDomains = new Set(['reddit.com', 'www.reddit.com', 'old.reddit.com', 'new.reddit.com', 'np.reddit.com', window.location.host]);
const scrollPosByPath = new Map<string, { pos: number, selector?: string }>();

export function setupSpaNavigation() {
	document.addEventListener('click', async (e: any) => {
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

		const anchor = e.target?.closest('a');
		if (!anchor || !anchor.href) return;

		const url = new URL(anchor.href, location.origin);

		if (redditDomains.has(url.host)) {
			e.preventDefault();

			let fullPath;

			if (url.hostname === "redd.it") {
				fullPath = "/comments" + url.pathname;
			} else if (url.pathname.includes("/s/")) {
				showToast({ kind: ToastType.Custom, text: "Resolving share URL..." });
				fullPath = new URL((await gqlFetch(
					"ShareUrl", "424a761fb3d80ef2ec18a7dfaa867a9a1acf44df218e526c4538850dc7415c86", { shortUrl: anchor.href }
				)).shareUrl.url).pathname;
			} else {
				fullPath = url.pathname + url.search + url.hash;
			}

			saveScrollPos();

			logger.log(`Redirecting link to internal route: ${fullPath}`, true);
			window.store.dispatch({
				type: "@@router/CALL_HISTORY_METHOD",
				payload: {
					method: "push",
					args: [fullPath]
				}
			});
		}
	}, true);


	window.addEventListener('popstate', () => {
		const path = window.location.pathname + window.location.search + window.location.hash;
		const scrollPos = scrollPosByPath.get(path);
		if (scrollPos) {
			setTimeout(() => {
				const el = scrollPos.selector ? document.getElementById(scrollPos.selector) : document.documentElement;
				if (el) {
					el.scrollTop = scrollPos.pos;
					logger.log(`Restored scroll position ${scrollPos.pos} for ${path}`, true);
				} else {
					logger.err(`Error restoring scroll position: element with ID '${scrollPos.selector}' was not found`);
				}
			}, 700);
		}
	});
}


function saveScrollPos() {
	const path = location.pathname + location.search + location.hash;
	const overlayScrollContainer = path.includes('/comments/') && document.getElementById("overlayScrollContainer");

	scrollPosByPath.set(path, overlayScrollContainer
		? { pos: overlayScrollContainer.scrollTop, selector: 'overlayScrollContainer' }
		: { pos: document.documentElement.scrollTop }
	);
}