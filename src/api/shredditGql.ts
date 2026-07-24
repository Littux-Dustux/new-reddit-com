import { getLogger } from "../logging";
import { multiErrorToast } from "../logging/toast";
import { RedditAPIError } from "./rest";

const logger = getLogger("api:gql-shreddit");

export default async function svcGqlFetch(operation: string, variables: any, options: { parseJSON?: boolean } = {}) {
	options.parseJSON ??= true;

	const resp = await window.gmFetch({
		method: "POST",
		url: "https://www.reddit.com/svc/shreddit/graphql?" + operation,
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"Origin": "https://www.reddit.com",
			"Referer": "https://www.reddit.com/",
		},
		data: JSON.stringify({
			operation,
			variables,
			csrf_token: window.csrfToken,
		}),
		anonymous: false,
	});

	if (resp.status === 200) {
		if (!options.parseJSON) return resp.responseText;

		const data = JSON.parse(resp.responseText);
		if (data.errors?.length) {
			logger.err(data.errors.length + " errors for " + operation, true, data.errors);
			multiErrorToast(data.errors);
			return data.data;
		} else {
			return data.data;
		}
	} else if (resp.status === 400) {
		throw new RedditAPIError(resp.status, `Error fetching shreddit gql operation ${operation}: invalid CSRF token (status: ${resp.status})`, "INVALID_CSRF_TOKEN", resp.responseText);
	} else if (resp.status === 500) {
		throw new Error(
			"Upstream server returned error status code and proxy returned 500. Most likely the variables are invalid. Response text: "+resp.responseText
		);
	} else {
		throw new RedditAPIError(resp.status, `Error fetching shreddit gql operation ${operation} (status: ${resp.status})`, "GQL_ERROR", resp.responseText);
	}
}