import { FormattingFlag } from "./richtext_types";

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

export const getRTJSONFirstText = (rtjson: any) => rtjson?.document[0]?.c?.[0]?.t;

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
							: {"e": "text", "t": "Quality: recommended", "f": [[FormattingFlag.strikethrough, 0, 20]]}
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
							: {"e": "text", "t": "Quality: medium", "f": [[FormattingFlag.strikethrough, 0, 15]]}
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


export const antiGifFuckGifs = (mediaMetadata: Record<string, any> | null) => {
	if (!mediaMetadata) return null;
	for (const media of Object.values(mediaMetadata)) {
		if (media.e === "AnimatedImage") {
			media.s.gif = `mp4:${media.s.mp4}|${media.p.find((m: any) => m.y > 100)?.u ?? media.p[0].u}`;
		}
	}
	return mediaMetadata;
}


const pauseVideoIntersectionObserver = new IntersectionObserver((entries) => {
	for (const entry of entries) {
		const video = entry.target as HTMLVideoElement;
		if (entry.isIntersecting) {
			video.play().catch(() => {});
		} else {
			video.pause();
		}
	}
}, { threshold: 0.5 });

window.addEventListener('error', function (event) {
	const target = event.target;

	// Verify the error came from an <img> tag with an .mp4 src
	if (target instanceof HTMLImageElement && target.src.startsWith('mp4:')) {
		const video = document.createElement('video');
		const [src, poster] = target.src.slice(4).split('|', 2) as [string, string];

		// Copy the source and essential attributes
		video.src = src;
		video.poster = poster;
		video.autoplay = false;
		video.loop = true;
		video.muted = true;
		video.playsInline = true;

		// Preserve classes, styles, and ID if present
		if (target.className) video.className = target.className;
		if (target.id) video.id = target.id;
		const style = target.getAttribute('style');
		if (style) video.setAttribute('style', style);

		// Swap the <img> with the new <video> element
		target.replaceWith(video);
		pauseVideoIntersectionObserver.observe(video);
	}
}, true);