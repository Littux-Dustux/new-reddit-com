export const getVoteStateNum = (likes: boolean | null) => (likes === null ? 0 : likes ? 1 : -1);

export const getVideoMediaMetadataGql = (data: any) => ({
	e: "RedditVideo",
	status: (data.status as string).toLowerCase(),
	dashUrl: data.dashUrl,
	hlsUrl: data.hlsUrl,
	id: data.id,
	x: data.width,
	y: data.height,
});

// export const getMediaMetadataFromGql: (gqlMedia: any) => Record<string, any> = window.importRedditModule('./src/reddit/helpers/graphql/normalizePostFromGql/index.ts').c;

export const getMuxedMP4sDownloadRTJSON = (muxedMp4s: any) => [
	{"e": "hr"},
	{
		"e": "h",
		"l": 1,
		"c": [
			{"e": "raw", "t": "Download the video above:"}
		],
	},
	{
		"e": "list",
		"o": false,
		"c": [
			{
				"e": "li",
				"c": [
					{
						"e": "par",
						"c": [muxedMp4s.recommended
							? {"u": muxedMp4s.recommended.url, "e": "link", "t": "Quality: recommended", "f": []}
							: {"e": "text", "t": "Quality: recommended", "f": [[8, 0, 20]]}
						],
					}
				],
			},
			{
				"e": "li",
				"c": [
					{
						"e": "par",
						"c": [muxedMp4s.medium
							? {"u": muxedMp4s.medium.url, "e": "link", "t": "Quality: medium", "f": []}
							: {"e": "text", "t": "Quality: medium", "f": [[8, 0, 15]]}
						],
					}
				],
			}
		],
	},
	{
		"c": [
			{
				"e": "text",
				"t": "Note that these download links were injected by this client and not typed by the commenter.",
				"f": [[2, 0, 91]]
			}
		],
		"e": "par"
	}
]