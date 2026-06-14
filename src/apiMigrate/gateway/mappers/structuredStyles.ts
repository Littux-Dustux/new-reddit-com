import { markdown } from "snudown-js";
import { getLogger } from "../../../logging";

const logger = getLogger("mapStructuredStyles");

const convertGqlSubredditStyles = (data: any) => (data && {
	backgroundColor: data.backgroundColor,
	backgroundImage: data.bannerBackgroundImage,
	backgroundImagePosition: "tiled",
	bannerBackgroundColor: data.bannerBackgroundColor,
	bannerBackgroundImage: data.bannerBackgroundImage,
	bannerBackgroundImagePosition: data.bannerBackgroundImagePosition?.toLowerCase() ?? "cover",
	bannerCommunityName: null,
	bannerCommunityNameFormat: "slashtag",
	bannerHeight: "medium",
	bannerOverlayColor: null,
	bannerPositionedImage: null,
	bannerPositionedImagePosition: null,
	bannerShowCommunityIcon: "show",
	communityIcon: data.icon,
	highlightColor: data.highlightColor,
	menuBackgroundBlur: null,
	menuBackgroundColor: data.primaryColor,
	menuBackgroundImage: data.mobileBannerImage,
	menuBackgroundOpacity: null,
	menuLinkColorActive: "#ffffff",
	menuLinkColorHover: "#dce4ef",
	menuLinkColorInactive: "#edeff1",
	menuPosition: null,
	mobileKeyColor: data.primaryColor,
	postBackgroundColor: data.postBackgroundColor,
	postBackgroundImage: null,
	postBackgroundImagePosition: null,
	postDownvoteCountColor: data.postDownvoteCountColor,
	postDownvoteIconActive: data.postDownvoteIconActive,
	postDownvoteIconInactive: data.postDownvoteIconInactive,
	postPlaceholderImage: data.postPlaceholderImage,
	postPlaceholderImagePosition: data.postPlaceholderImagePosition?.toLowerCase(),
	postTitleColor: data.postTitleColor,
	postUpvoteCountColor: data.postUpvoteCountColor,
	postUpvoteIconActive: data.postUpvoteIconActive,
	postUpvoteIconInactive: data.postUpvoteIconInactive,
	postVoteIcons: data.postVoteIcons?.toLowerCase(),
	primaryColor: data.primaryColor,
	secondaryBannerPositionedImage: null,
	sidebarWidgetBackgroundColor: data.sidebarWidgetBackgroundColor,
	sidebarWidgetHeaderColor: data.sidebarWidgetHeaderColor,
	submenuBackgroundColor: "#8ba6ca",
	submenuBackgroundStyle: "custom",
});

const convertGqlWidgets = ({ widgets, moderatorsInfo, rules }: any, subredditData: any) => {
	const widgetsState: Record<string, any> = {
		items: {},
		layout: {
			idCardWidget: '',
			moderatorWidget: '',
			sidebar: { order: [] },
			topbar: { order: [] },
		},
	};

	for (const widgetLocation of ["orderedSidebarWidgets", "orderedTopbarWidgets"]) {
		for (const gqlWidget of widgets[widgetLocation]) {
			const widgetData: Record<string, any> = {
				id: gqlWidget.id,
				styles: { backgroundColor: null, headerColor: null }
			};
			if (gqlWidget.shortName) widgetData.shortName = gqlWidget.shortName;

			let shouldAddIdToLayoutOrder = true;

			switch (gqlWidget.__typename) {
				case "IdCardWidget":
					shouldAddIdToLayoutOrder = false;
					widgetsState.layout.idCardWidget = gqlWidget.id;
					Object.assign(widgetData, gqlWidget);
					widgetData.currentlyViewingCount = subredditData.communityStats?.weeklyActiveUsersCount;
					widgetData.description = subredditData.publicDescriptionText;
					widgetData.subscribersCount = subredditData.subscribersCount;
					break;

				case "ModeratorWidget":
					shouldAddIdToLayoutOrder = false;
					widgetsState.layout.moderatorWidget = gqlWidget.id;
					widgetData.kind = "moderators";
					widgetData.mods = Array(gqlWidget.moderators.length);

					for (let i = 0; i < gqlWidget.moderators.length; i++) {
						const gqlModData = gqlWidget.moderators[i];
						const flair = gqlModData.flair ?? {};
						widgetData.mods[i] = {
							name: gqlModData.redditor?.name,
							authorFlairBackgroundColor: flair.template?.backgroundColor,
							authorFlairRichText: flair.template?.richtext ? JSON.parse(flair.template.richtext) : [],
							authorFlairText: flair.text,
							authorFlairTextColor: flair.template?.textColor ? flair.template.textColor.toLowerCase() : "dark",
							authorFlairType: flair.template?.type ?? "text",
						};
					}

					widgetData.totalMods = moderatorsInfo?.edges?.length ?? gqlWidget.moderators.length;
					break;

				case "TextAreaWidget":
					widgetData.kind = "textarea";
					widgetData.text = gqlWidget.text.markdown;
					widgetData.textHtml = gqlWidget.text.html;
					break;

				case "SubredditRulesWidget":
					widgetData.kind = "subreddit-rules";
					widgetData.display = gqlWidget.display;
					widgetData.data = rules?.map((rule: any) => ({
						createdUtc: 0,
						description: rule.content.markdown,
						descriptionHtml: rule.content.html,
						priority: rule.priority,
						shortName: rule.name,
						violationReason: rule.violationReason,
					}));
					break;

				case "CalendarWidget":
					widgetData.kind = "calendar";
					widgetData.configuration = {
						numEvents: 10,
						showDate: gqlWidget.isDateShown,
						showDescription: gqlWidget.isDescriptionShown,
						showLocation: false,
						showTime: gqlWidget.isTimeShown,
						showTitle: gqlWidget.isTitleShown,
					};
					widgetData.data = gqlWidget.events?.map((calendarEvent: any) => ({
						allDay: calendarEvent.isAllDay,
						description: calendarEvent.description.preview,
						endTime: Number(new Date(calendarEvent.endsAt)),
						startTime: Number(new Date(calendarEvent.startsAt)),
						title: calendarEvent.title.markdown,
						titleHtml: markdown(calendarEvent.title.markdown),
					}));
					break;

				case "MenuWidget":
					widgetData.kind = "menu";
					widgetData.data = gqlWidget.menus;
					widgetData.showWiki = gqlWidget.isWikiShown;
					break;

				case "CommunityListWidget":
					widgetData.kind = "community-list";
					widgetData.data = gqlWidget.communities?.map((sub: any) => ({
						type: sub.type.toLowerCase(),
						communityIcon: sub.styles.icon ?? "",
						iconUrl: sub.styles.legacyIcon?.url ?? "",
						isSubscribed: sub.isSubscribed,
						name: sub.name,
						primaryColor: sub.styles.primaryColor,
						subscribers: sub.subscribersCount,
					}));
					break;

				case "ButtonWidget":
					widgetData.kind = "button";
					widgetData.description = gqlWidget.description.markdown;
					widgetData.descriptionHtml = markdown(gqlWidget.description.markdown);
					widgetData.buttons = gqlWidget.buttons.map((button: any) => ({
						color: button.color,
						text: button.text,
						url: button.media.linkUrl,
					}));
					break;

				case "ImageWidget":
					widgetData.kind = "image";
					widgetData.data = gqlWidget.data.map((imageItem: any) => ({
						linkUrl: imageItem.linkUrl,
						url: imageItem.source.url,
						...imageItem.source.dimensions
					}));
					break;

				default:
					logger.err("Could not map widget '"+gqlWidget.__typename+"' to gateway format", gqlWidget)
			}

			widgetsState.items[gqlWidget.id] = widgetData;

			if (shouldAddIdToLayoutOrder) {
				widgetLocation === "orderedSidebarWidgets"
					? widgetsState.layout.sidebar.order.push(gqlWidget.id)
					: widgetsState.layout.topbar.order.push(gqlWidget.id);
			}
		}
	};

	return widgetsState;
};

export const processStructuredStyles = (gqlSubredditWithStructuredStyles: any, gqlSubredditAboutInfo: any) => ({
	data: gqlSubredditAboutInfo.__typename !== "Subreddit" ? {} : {
		flairTemplate: {},
		style: convertGqlSubredditStyles(gqlSubredditWithStructuredStyles.styles),
		content: {
			widgets: convertGqlWidgets(gqlSubredditWithStructuredStyles, gqlSubredditAboutInfo)
		}
	}
});