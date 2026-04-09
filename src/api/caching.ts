import { getLogger } from "../logging/logger";

const logger = getLogger("cache");

window.APICache = new Map<any, { data: any, ts: number }>();

export const getCache = (key: any, maxAge = 5 * 60_000) => {
	const entry = window.APICache.get(key);
	if (!entry) return null;
	if (maxAge === -1 || Date.now() - entry.ts < maxAge) {
		logger.dbg("Returned cache: " + key);
		return entry.data;
	} else {
		window.APICache.delete(key);
		return null;
	}
};

export const setCache = (key: any, data: any) => window.APICache.set(key, { data, ts: Date.now() });