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
