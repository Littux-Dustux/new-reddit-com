import type { InterceptorHandler } from "../interceptXhr";
import { gqlFetch } from "../../api/gql";
import { getLogger } from "../../logging/logger";
import idMapping from './oldGqlIdNameMap.json';
import { type OldOperation, gqlFedMap } from "./mapping";
import svcGqlFetch from "../../api/shredditGql";
import { RedditAPIError } from "../../api/rest";

const logger = getLogger("gqlMigrate");

const defaultResponse = {
	jsonResponse: '{"data":{}}',
	status: 200,
};

const shutUpOperations = new Set<OldOperation>([
	"SubredditPageExtra", "CommentsPageExtra", "RedditorMultireddits", "GetPostReactInfo",
	"SubredditChatChannelRecommendations", "GetTournaments",
	"CommentsPageLastAuthorModNotes", "ModQueueTriggers", "PostIsTrackingCrossposts"
]);

export const gqlMigrationInterceptor: InterceptorHandler = async (_, data: any) => {
	let { id, variables }: { id: string; variables: any } = JSON.parse(data);
	const opName = (idMapping as Record<string, string>)[id] as OldOperation;
	if (!opName) {
		logger.err("gql id '" + id + "' isn't recognized", true);
		return defaultResponse;
	}

	const mapping = gqlFedMap[opName];
	if (!mapping) {
		logger.err(opName + " hasn't been ported to gql-fed yet", !shutUpOperations.has(opName), variables);
		return defaultResponse;
	}

	if (mapping.hardcodedResp) {
		logger.dbg("returning hardcoded response for " + opName);
		return {
			jsonResponse: mapping.hardcodedResp,
			status: 200,
		};
	}

	if (mapping.process) return {
		jsonResponse: await mapping.process(variables),
		status: 200
	};
	if (mapping.mapVars) variables = mapping.mapVars(variables);

	
	let gqlData;

	try {
		if (mapping.useShredditGqlProxy) {
			gqlData = await svcGqlFetch(mapping.operationName, variables, { parseJSON: Boolean(mapping.mapResp) });
		} else if (!mapping.sha256Hash) {
			logger.crt(opName + " doesn't have a sha256Hash, and uses gql-fed, so it can't be fetched. It is a mistake, so report it");
			return defaultResponse;
		} else {
			gqlData = await gqlFetch(mapping.operationName, mapping.sha256Hash, variables, { parseJSON: Boolean(mapping.mapResp) });
		}
	} catch (e) {
		if (e instanceof RedditAPIError) {
			return {
				jsonResponse: e.rawPayload,
				status: e.status,
			}
		} else throw e;
	}

	return {
		jsonResponse: mapping.mapResp
			? JSON.stringify({ data: mapping.mapResp(gqlData) })
			: gqlData,
		status: 200,
	}
}