import { gqlFetch } from "../../api/gql";
import { getLogger } from "../../logging";

const logger = getLogger("gql:search");

export async function processGeneralSearch({ includePosts, postsAfter, includeComments, commentsAfter, includeCommunities, communitiesAfter, communityRows, includeAuthors, authorsAfter, authorRows, ...vars }: Record<string, any>) {
	console.log({ includePosts, includeComments, includeCommunities, includeAuthors });
	const searchPromises = [];

	includePosts &&
		searchPromises.push(
			gqlFetch("SearchPosts", "8610e33521c90caa8d12576800c18b708ce0d19df3dfac8e2aad55d9860e4bf9",
				{ pageSize: 25, afterCursor: postsAfter, ...vars },
			).then((data) => {
				for (const { node: { flair } } of data.search.general.posts.edges) {
					if (flair && !flair.richtext && flair.type === "richtext") {
						flair.type = "text";
					}
				};
				return data;
			}),
		);
	includeComments &&
		searchPromises.push(
			gqlFetch("SearchComments", "9c77ffed05d959bf7ba503a801e77d7e2b83dc7eae286a06c3d21c3abe25df1e", 
				{ pageSize: 25, afterCursor: commentsAfter, ...vars },
			),
		);
	includeCommunities && /* logger.wrn("Communities search is currently broken", true); */
		searchPromises.push(
			gqlFetch("SearchCommunities", "a3333069c1ead3ceec6d9bf4da4185ff584f69d0ba8b586e545b32ea62170932",
				{ pageSize: communityRows, afterCursor: communitiesAfter, ...vars },
			).then(({ search }) => {
				search.general.communities.edges = search.general.communities.edges.map(({ node: { description, publicDescriptionText, ...rest } }: any) => ({
					node: {
						publicDescription: description || {
							markdown: publicDescriptionText,
							richtext: '{"document":[]}'
						},
						publicDescriptionText,
						...rest
					}
				}));
				return { search };
			}),
		);

	includeAuthors && logger.wrn("User search is currently broken", true);
	/*
		searchPromises.push(
			gqlFetch("SearchPeople", "d9211ac33f72079f25cb4c8a8e00a2b4889e984f70278ec91283965c7856d33d",
				{ pageSize: authorRows, afterCursor: authorsAfter, ...vars }
			),
		);
	*/

	const results = await Promise.all(searchPromises);

	const output = {
		data: {
			search: {
				general: results.reduce((general: Record<string, any>, result: Record<string, any>) =>
					Object.assign(general, result.search.general), {}),
			}
		}
	};
	console.debug("Output", output);
	return JSON.stringify(output);
}

export function fixSearchTypeaheadResp(data: any) {
	for (const profile of data.search.typeaheadByType.profiles) {
		profile.name = profile.redditorInfo?.name;
	}
	return data;
}