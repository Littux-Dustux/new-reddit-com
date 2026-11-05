import type { ModerationVerdict, AccountType } from "../../../../api/types/gql";
import type { PostAndCommentCommon } from "../../types/common";

type ModerationInfo = {
	//isAutoCollapsedFromCrowdControl: boolean;
	verdict: ModerationVerdict;
	verdictAt: string;
	banReason: string;
	reportCount: number;
	//isRemoved?: boolean;
	verdictByRedditorInfo:
		| { __typename: "DeletedRedditor"; id: string; name: string }
		| {
				__typename: "Redditor";
				id: string;
				name: string;
				//prefixedName: string;
				accountType: AccountType;
				iconSmall: { __typename?: "MediaSource"; url?: string | null };
				snoovatarIcon: { __typename?: "MediaSource"; url?: string | null };
		  }
		| { __typename: "UnavailableRedditor"; id: string; name: string };
	modReports?: Array<{
		__typename?: "ModReport";
		reason: string;
		authorInfo:
			| { __typename: "DeletedRedditor"; id: string; name: string }
			| {
					__typename: "Redditor";
					id: string;
					name: string;
					prefixedName: string;
					accountType: AccountType;
					iconSmall: { __typename?: "MediaSource"; url?: string | null };
					snoovatarIcon: { __typename?: "MediaSource"; url?: string | null };
			  }
			| { __typename: "UnavailableRedditor"; id: string; name: string };
	}> | null;
	userReports?: Array<{ __typename?: "UserReport"; reason: string; count: number }> | null;
	modQueueTriggers?: any;
	lastAuthorModNote?: any;
	isReportingIgnored?: boolean;
};

export function mapModerationInfoCommon(info: ModerationInfo | null | undefined) {
	if (!info) return {};

	const data: Partial<PostAndCommentCommon> = {
		banReason: info.banReason,
		ignoreReports: info.isReportingIgnored,
		lastAuthorModNote: info.lastAuthorModNote,
		modQueueTriggers: info.modQueueTriggers,
		modReports: info.modReports?.map(report => [report.reason, report.authorInfo.name]) ?? [],
		numReports: info.reportCount,
		userReports: info.userReports?.map(report => [report.reason, report.count, false, false]) ?? [],
	};

	if (info.verdict) {
		const ts = Date.parse(info.verdictAt);
		const byName = info.verdictByRedditorInfo?.name;

		switch (info.verdict) {
			case "ADMIN_APPROVED":
			case "MOD_APPROVED":
				data.approvedAtUTC = ts;
				data.approvedBy = byName;
				break;
			case "ADMIN_REMOVED":
			case "MOD_REMOVED":
			case "ADMIN_SPAMMED":
			case "MOD_SPAMMED":
				data.bannedAtUTC = ts;
				data.bannedBy = byName;
				data.isSpam = info.verdict === "ADMIN_SPAMMED" || info.verdict === "MOD_SPAMMED";
				break;
		}
	};

	return data;
}
