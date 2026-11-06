export function* chunkIterable<T>(iterable: Iterable<T>, chunkSize: number): Generator<T[]> {
	let chunk: T[] = [];
	for (const item of iterable) {
		chunk.push(item);
		if (chunk.length === chunkSize) {
			yield chunk;
			chunk.length = 0;
		}
	}

	if (chunk.length > 0) {
		yield chunk;
	}
}

export function convertHeadersStringToObject(headersString: string): Record<string, string> {
	const headers: Record<string, string> = {};
	const headerLines = headersString.split(/\r?\n/);
	for (const line of headerLines) {
		const [key, value] = line.split(":", 2);
		if (key && value) {
			headers[key.trim()] = value.trim();
		}
	}
	return headers;
}

export const truncText = (text: string, limit: number) => text.length > limit ? text.slice(0, limit) + "…" : text;

export const errToStr = (err: any) =>
	!err ? 'Unknown error' : (err.statusText === ""
		? 'Unknown network error'
		: err.statusText ?? (err.message || JSON.stringify(err))
	);


const parseVersion = (version: string) =>
	version.slice(1).split('.', 3).map(part => Number(part)) as [number, number, number];

/** Compare two versions of format vN.N.N. If v1 > v2, positive value is returned */
export const compareVersions = (v1: string, v2: string): number => {
	const [major1, minor1, patch1] = parseVersion(v1);
	const [major2, minor2, patch2] = parseVersion(v2);

	if (major1 !== major2) return major1 - major2;
	if (minor1 !== minor2) return minor1 - minor2;
	return patch1 - patch2;
}