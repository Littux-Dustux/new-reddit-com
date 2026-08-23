import { gqlFetch } from "../api/gql";
import { getLogger, showToast, ToastType } from "../logging";

type StateLoid = { loid: string, loidCreated: string, version: number, blob: string };

export const getLoidState = (loidString?: string) => {
	const [loid, version, loidCreated, blob] = (loidString ?? window.loid).split(".");
	return {
		loid,
		loidCreated,
		version: Number(version),
		blob
	} as StateLoid;
}

export const convertStateLoidToString = (loidState: StateLoid): string =>
	`${loidState.loid}.${loidState.version}.${loidState.loidCreated}.${loidState.blob}`;