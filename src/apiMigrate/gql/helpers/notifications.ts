export const convertAnnouncementToNotification = (announcement: any): any => ({
	__typename: "InboxNotification",
	id: announcement.id,
	title: announcement.subject,
	body: announcement.announcementBody?.preview ?? "",
	deeplinkUrl: announcement.deeplinkURL,
	sentAt: announcement.sentAt,
	readAt: announcement.readAt,
	viewedAt: announcement.viewedAt,
	avatar: {
		url: announcement.author?.snoovatarIcon?.url ?? announcement.author?.icon?.url ?? "",
		isNsfw: announcement.author?.profile?.isNsfw ?? false,
	},
	isHideNotifEligible: false,
	isToggleMessageTypeEligible: false,
	isToggleNotificationUpdateEligible: false,
	isToggleUpdateFromSubredditEligible: false,
	isToggleLowUpdateFromSubredditEligible: false,
	context: {
		__typename: "BasicInboxNotificationContext",
		messageType: "ONE_OFF",
	},
});
