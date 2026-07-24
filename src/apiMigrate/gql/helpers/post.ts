import { fixAwardings } from "./award";
import { fixFlair } from "./flair";

export function fixGqlPost(node: any) {
	if (node.__typename === "PostRecommendation") node = node.postInfo;
	if (node.crosspostRoot?.post) {
		node.crosspostRoot.postInfo = fixGqlPost(node.crosspostRoot.post);
		delete node.crosspostRoot.post;
	}
	if (node.awardings) fixAwardings(node.awardings);
	if (node.flair?.template) fixFlair(node.flair);
	if (node.authorFlair?.template) fixFlair(node.authorFlair);
	return node;
}

export function fixGqlListing(connection: any) {
	for (const { node } of connection.edges) {
		fixGqlPost(node);
	}
	return connection;
}

export function fixPopularElements(connection: any) {
	for (const edge of connection.edges) {
		if (edge.node.__typename === "PostRecommendation") {
			edge.node = edge.node.postInfo;
		}
		// iOS query lacks this, resulting in u/[deleted]
		const authorInfo = edge.node.authorInfo;
		if (authorInfo) {
			authorInfo.__typename = "Redditor";
			if (authorInfo.profile) {
				authorInfo.profile.__typename = "Profile"
			}
		}
		fixGqlPost(edge.node);
	}
	return connection;
}