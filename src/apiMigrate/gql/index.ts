import type { InterceptorHandler } from "../../interceptor/xhr";
import { gqlFetch } from "../../api/gql";
import { getLogger } from "../../logging/logger";
import idMapping from './oldGqlIdNameMap.json';
import { type OldOperation, gqlFedMap } from "./mapping";

const logger = getLogger("gqlMigrate");

const defaultResponse = '{"errors":[{"message":"Unknown operation"}],"data":{}}';

export const gqlMigrationInterceptor: InterceptorHandler = async (_, data: any) => {
	let { id, variables }: { id: string; variables: any } = JSON.parse(data);
	const opName = (idMapping as Record<string, string>)[id] as OldOperation;
	if (!opName) {
		logger.err("gql id '" + id + "' isn't recognized", true);
		return defaultResponse;
	}

	const mapping = gqlFedMap[opName];
	if (!mapping) {
		logger.err(opName + " hasn't been ported to gql-fed yet");
		return defaultResponse;
	}

	if (mapping.hardcodedResp) {
		logger.wrn("returning hardcoded response for " + opName, true);
		return mapping.hardcodedResp;
	}

	if (mapping.process) return mapping.process(variables);
	if (mapping.mapVars) variables = mapping.mapVars(variables);

	if (!mapping.sha256Hash) {
		logger.err(opName + " doesn't have a sha256Hash, so it can't be fetched. It is a mistake, so report it", true);
		return defaultResponse;
	}

	if (mapping.mapResp) {
		const originalData = await gqlFetch(mapping.operationName, mapping.sha256Hash, variables);
		return JSON.stringify({ data: mapping.mapResp(originalData) });
	} else {
		return await gqlFetch(mapping.operationName, mapping.sha256Hash, variables, { parseJSON: false });
	}
}