import type { InterceptorHandler } from "./interceptXhr";
import { getLogger } from "../logging";

// '{"type":"js","releaseClient":"7ec0af65c85b791780d404592e1b53556f558c74-production","appName":"whitespace","error":{"isLoggedOut":true,"url":"/","message":"An unexpected ad event type was returned from graphQL: VENDOR_FULLY_IN_VIEW with url null","stacktrace":[{"colno":22428,"filename":"https://www.redditstatic.com/desktop2x/Frontpage.c7f55dad41fbb61f2e0a.js","function":"K","in_app":true,"lineno":1},{"colno":20587,"filename":"https://www.redditstatic.com/desktop2x/Frontpage.c7f55dad41fbb61f2e0a.js","function":"./src/reddit/actions/frontpage/index.ts/K/i<","in_app":true,"lineno":1},{"colno":19720,"filename":"https://www.redditstatic.com/desktop2x/Frontpage.c7f55dad41fbb61f2e0a.js","function":"I","in_app":true,"lineno":1},{"colno":1008903,"filename":"https://www.redditstatic.com/desktop2x/Governance~Reddit.f38cbc1b092de66bb711.js","function":"re","in_app":true,"lineno":1},{"colno":1004328,"filename":"https://www.redditstatic.com/desktop2x/Governance~Reddit.f38cbc1b092de66bb711.js","function":"z","in_app":true,"lineno":1},{"colno":997967,"filename":"https://www.redditstatic.com/desktop2x/Governance~Reddit.f38cbc1b092de66bb711.js","function":"R","in_app":true,"lineno":1},{"colno":998051,"filename":"https://www.redditstatic.com/desktop2x/Governance~Reddit.f38cbc1b092de66bb711.js","function":"./src/reddit/helpers/graphql/normalizePostFromGql/index.ts/R/<","in_app":true,"lineno":1},{"colno":2029439,"filename":"https://www.redditstatic.com/desktop2x/vendors~Governance~Reddit.2f67e72146622b933b15.js","function":"d","in_app":true,"lineno":1}],"breadcrumbs":[{"timestamp":1782522493.21,"category":"sentry","event_id":"5979bda6cd754c55a3941038c3a2bb8f","level":"info","message":"An unexpected ad event type was returned from graphQL: VIDEO_WATCHED_25 with url null"},{"timestamp":1782522493.15,"message":"TOAST__DISPLAYED","category":"redux-action"},{"timestamp":1782522492.514,"message":"TOAST__DISPLAYED","category":"redux-action"},{"timestamp":1782522492.332,"message":"GROUPM_VIEWABLE","category":"redux-action"},{"timestamp":1782522492.316,"message":"AD__VIEWABLE_IMPRESSION","category":"redux-action"},{"timestamp":1782522492.286,"message":"TOAST__DISMISSED","category":"redux-action"},{"timestamp":1782522492.263,"message":"TOAST__DISMISSED","category":"redux-action"},{"timestamp":1782522492.227,"message":"TOAST__DISMISSED","category":"redux-action"}],"tags":{"project":"whitespace","app":"whitespace"}}}'

type StackTraceEntry = {
	colno: number;
	filename: string;
	function: string;
	in_app: boolean;
	lineno: number;
};

type BreadcrumbEntry = {
	category: string;
	timestamp: number;
	message: string;
	event_id?: string;
	level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
	data?: any;
};

interface ErrorLoggerData {
	type: "js";
	releaseClient: "7ec0af65c85b791780d404592e1b53556f558c74-production";
	appName: "whitespace";
	error: {
		isLoggedOut: boolean;
		url: string;
		message: string;
		stacktrace: StackTraceEntry[];
		breadcrumbs: BreadcrumbEntry[];
		tags: { project: "whitespace"; app: "whitespace" };
		status?: number;
	};
}

const logger = getLogger('relativePath');
const emptyResponse = {
	jsonResponse: '{"status":200,"ok":true,"success":true}',
	status: 200
}

export const relativePathHandler: InterceptorHandler = async ({ url, method }, data) => {
	switch (url) {
		case "/errors":
			const parsed: ErrorLoggerData = JSON.parse(data);
			if (typeof parsed.error.status !== "number" && parsed.error.message) {
				logger.err(parsed.error.message, true, parsed.error);

				// eg: {"function": "./src/reddit/actions/frontpage/index.ts/K/i<"}
				const moduleErrorEntry = parsed.error.stacktrace?.find(stack => stack.function.startsWith("./"));
				if (moduleErrorEntry)
					logger.err("At "+moduleErrorEntry.function+" in "+moduleErrorEntry.filename);
			}
			return {
				jsonResponse: '{}',
				status: 200
			}

		case "/refreshproxy":
			await window.getToken();
			return {
				jsonResponse: JSON.stringify({
					session: {
						tokenType: "RSSG",
						accessToken: window.tokenCache.token,
						expires: window.tokenCache.expires
					}
				}),
				status: 200
			}

		case "/timings/rum":
		case "/timings/route":
		case "/timings/mount":
		case "/timings/gql":
		case "/timings/perf":
		case "/timings/scrollfps":
			return emptyResponse;

		default:
			logger.err("Unkown relative path request found (path: "+method+" "+url+") returning dummy data", true, { url, method, data });
			return emptyResponse;
	}
}