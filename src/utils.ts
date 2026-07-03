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