import { getLogger } from "../../logging";
import { truncText } from "../../utils";
import type { PostFilter, SubredditFilterStandalone } from "./types";

const logger = getLogger("filterReddit");
const filterHits = new Map<SubredditFilterStandalone | PostFilter, number>();

export function flushAndLogFilterHits() {
	for (const [filter, count] of filterHits.entries()) {
		if (count > 0) {
			logger.inf(
				`Filtered ${count} posts by ${
					typeof (filter as PostFilter).invertSubreddit === 'boolean' ? 'post' : 'subreddit'
				} filter '${truncText(filter.title, 20)}'`,
				true
			);
		}
	}
	filterHits.clear();
}

export function addFilterHit(fil: SubredditFilterStandalone | PostFilter) {
	if (filterHits.has(fil)) {
		filterHits.set(fil, (filterHits.get(fil) as number) + 1);
	} else {
		filterHits.set(fil, 1);
	}	
}