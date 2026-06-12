export default {
    mapVars: ({ first, ...rest }: any) => ({ pageSize: first, subredditIconMaxWidth: 64, includeAnnouncement: false, ...rest }),
	mapResp: ({ notificationInbox }: any) => {
		notificationInbox.elements.edges = notificationInbox.elements.edges.filter(({ node }: any) => node.__typename === "InboxNotification");
		return { notificationInbox };
	}
}