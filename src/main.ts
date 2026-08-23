import { getLogger } from "./logging";
import { initAPIMigratorInterceptors } from "./apiMigrate";
import { hydrateState, state as initialState, isLoggedIn } from "./state";
import { patchWebSocket } from "./apiMigrate/liveChat";
import { setupSpaNavigation } from "./state/spaNavigation";

const logger = getLogger('init');

logger.dbg("Initializing client...");
window.clientLoaded = false;


export const userscriptLoaded = ((): Promise<void> => {
	if (window.__MODREDDITCOM_REVIVED__) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		window.addEventListener("rAPI-accessToken-ready", () => resolve(), { once: true });
	});
})();

export type State = typeof initialState;


const addScript = (url: string): Promise<HTMLScriptElement> => {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		script.async = true;

		script.onload = () => {
			resolve(script);
		};

		script.onerror = () => {
			reject(new Error("Error loading script " + url));
		};

		document.body.appendChild(script);
	});
};


async function main() {
	await userscriptLoaded;
	logger.dbg("Userscript loaded, loading client...");
	if (!window.__MODREDDITCOM_REVIVED__.event.detail.accessToken) {
		logger.err("Access token hasn't been fetched by the userscript. Falling back to anonymous token.");
		isLoggedIn.value = false;
	} else {
		isLoggedIn.value = true;
		await hydrateState();
		logger.dbg("State hydrated");
	}

	(window as any).___r = initialState;

	const container: any = document.getElementById("2x-container");
	if (!container) {
		throw new Error("root container not found");
	}

	initAPIMigratorInterceptors();
	patchWebSocket();
	setupSpaNavigation();
	await addScript("https://www.redditstatic.com/desktop2x/Reddit.e6908df657b523d36c19.js");

	const timer = setInterval(() => {
		const store = container._reactRootContainer?._internalRoot?.current?.alternate?.memoizedState?.element?.props?.children?.props?.store;

		if (store) {
			window.store = store;
			logger.dbg("Redux store captured successfully!");
			clearInterval(timer);
			window.clientLoaded = true;

			// Hack to load the required chunks
			const originalPath = location.pathname + location.search + location.hash;

			window.store.dispatch({
				type: "@@router/CALL_HISTORY_METHOD",
				payload: {
					method: "replace",
					args: ["/"],
				}
			});

			setTimeout(() => window.store.dispatch({
				type: "@@router/CALL_HISTORY_METHOD",
				payload: {
					method: "replace",
					args: [originalPath]
				}
			}), 100);
		}
	}, 50);

	setTimeout(() => {
		if (!window.store) throw new Error("Timed out trying to capture redux store. (>5 seconds)");
		clearInterval(timer);
	}, 5000);

};

main();

export const getState = (): State => {
	return window.store?.getState() ?? initialState
}
