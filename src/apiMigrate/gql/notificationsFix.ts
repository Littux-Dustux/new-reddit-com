import { gqlFetch } from "../../api/gql";
import { getState } from "../../main";
import { convertAnnouncementToNotification } from "./helpers/notifications";

let clearLoadedTimeout: number | undefined;

export const notificationsInboxFix = {
	mapVars: ({ first, ...rest }: any) => ({
		pageSize: first === 5 ? 10 : 25,
		subredditIconMaxWidth: 64,
		includeAnnouncement: true, 
		...rest
	}),
	mapResp: ({ notificationInbox }: any) => {
		// To not be stuck with old notifications until reload
		if (clearLoadedTimeout) {
			clearTimeout(clearLoadedTimeout);
		} else {
			clearLoadedTimeout = setTimeout(() => {
				getState().notificationsInbox.notifications = [];
				getState().notificationsInbox.pageInfo = null;
				clearLoadedTimeout = undefined;
			}, 40e3);
		};
		
		for (const edge of notificationInbox.elements.edges) {
			if (edge.node.__typename === "InboxAnnouncement") {
				edge.node = convertAnnouncementToNotification(edge.node);
			}
		};
		return { notificationInbox };
	}
}


export const mapBadgeIndicators = ({ badgeIndicators }: any) => ({
	badgeIndicators: {
		messageTab: badgeIndicators.messageTab,
		activityTab: badgeIndicators.activityTab,
		inboxTab: badgeIndicators.inboxTab,
		chatUnreadMessages: {"count":0,"style":"NUMBERED"},
		chatUnreadMentions: {"count":0,"style":"NUMBERED"},
		chatV2UnreadMessages: {"count": badgeIndicators.chatTab.count,"style":"NUMBERED"},
		chatHasNewMessages: {"isShowing": badgeIndicators.chatHasNewMessages.isShowing,"style":"FILLED"},
		chatUnacceptedInvites: {"count":0,"style":"NUMBERED"}
	}
});


let isBadgeIndicatorsFetching = false;

setInterval(async () => {
	if (document.hidden || clearLoadedTimeout || isBadgeIndicatorsFetching) return;

	isBadgeIndicatorsFetching = true;

	window.store.dispatch({
		type: "APP_BADGES__LOADED",
		payload: mapBadgeIndicators(
			await gqlFetch("BadgeCount", "6e5b40ea4193a6fcfd6890518f4cdde524e434243d055c33a552af2e42e0a433", {})
		).badgeIndicators,
	});

	isBadgeIndicatorsFetching = false;
}, 300e3);