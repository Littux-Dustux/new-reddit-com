import type { AnimatedImageAssetR2 } from "../apiMigrate/gateway/types/common";
import { getLogger } from "../logging";
import { chunkIterable } from "../utils";

type GiphyGif = {
	id: string;
	url: string;
	images: {
		fixed_height: {
			height: string;
			width: string;
			size: string;
			url: string;
			mp4_size: string;
			mp4: string;
			webp_size: string;
			webp: string;
		};
	};
	/* user: {
		profile_url: string;
		display_name: string;
		username: string;
	}; */
}

type GiphyResponse = {
	data: GiphyGif[];
	meta: {
		status: number;
		msg: string;
		error_code?: string;
	}
};


// const FIELDS = "id,url,images.fixed_height,user.profile_url,user.display_name,user.username";
const GIPHY_API_KEY = "k2kwyMA6VeyHM6ZRT96OXDGaersnx73Z"; // API key used by Reddit on their website

const logger = getLogger("giphyAPI");

export async function getGIPHYGifsByIds(ids: Iterable<string>): Promise<Record<string, AnimatedImageAssetR2>> {
	const apiPromises: Promise<Response>[] = [];

	for (const chunk of chunkIterable(ids, 100)) {
		apiPromises.push(fetch(`https://api.giphy.com/v1/gifs?ids=${chunk.join(",")}&fields=id,url,images.fixed_height&api_key=${GIPHY_API_KEY}`, {
			headers: {
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(10_000),
		}));
	}

	const responses = await Promise.all(apiPromises);
	const idToGif: Record<string, AnimatedImageAssetR2> = {};

	for (const response of responses) {
		const data: GiphyResponse = await response.json();
		if (!response.ok || data.meta.status !== 200) {
			throw new Error(`${response.status}: ${data.meta.msg}: ${data.meta.error_code}`);
		}

		logger.log(`GET (${data.meta.status} ${data.meta.msg}): ${data.data.length} GIFs fetched`);

		for (const gif of data.data) {
			// @ts-ignore
			idToGif[gif.id] = {
				status: "valid",
				e: "AnimatedImage",
				m: "image/gif",
				s: {
					x: Number(gif.images.fixed_height.width),
					y: Number(gif.images.fixed_height.height),
					gif: gif.images.fixed_height.url,
					mp4: gif.images.fixed_height.mp4,
				},
				p: [],
				ext: gif.url,
				t: "giphy",
				// id: "giphy|"+gif.id,
				/* profile_url: gif.user.profile_url,
				display_name: gif.user.display_name,
				username: gif.user.username */
			};
		}
	}

	return idToGif;
}