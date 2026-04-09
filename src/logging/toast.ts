export enum ToastType {
	SuccessAward = 0,
	SuccessCommunity = 1,
	SuccessCommunityGreen = 2,
	SuccessMod = 3,
	Error = 4,
	Undo = 5,
	EuCookiePolicy = 6,
	UappBanner = 7,
	AuthError = 8,
	Custom = 9,
	Modal = 10,
	SuccessLockComment = 11,
	SuccessUnlockComment = 12,
	SuccessEndBroadcast = 13,
}

export type ToastOptions = {
	type: ToastType;
	id?: string;
	text: string;
	buttonText?: string;
	buttonAction?: () => void;
};

export const clearToast = (id: string) => window.store?.dispatch({ type: "TOAST__DISMISSED", payload: id });

export const showToast = (options: ToastOptions, duration: number = 4000) => {
	options.id ??= options.text /* Date.now().toString() + Math.random().toString() */;

	window.store?.dispatch({
		type: "TOAST__DISPLAYED",
		payload: options,
	});

	if (duration > 0) {
		setTimeout(() => clearToast(options.id as string), duration);
	}
};

export const multiErrorToast = (messages: any[]) => {
	if (messages.length < 10) {
		messages.forEach((message) => {
			showToast({
				type: ToastType.Error,
				text: typeof message === "string" ? message : JSON.stringify(message)
			});
		});
	} else {
		navigator.clipboard
			.writeText(JSON.stringify(messages))
			.then(() => {
				showToast({ type: ToastType.Error, text: "Too many errors (> 10), copied to clipboard" });
			})
			.catch((e) => {
				showToast({ type: ToastType.Error, text: "Error copying errors to clipboard. See console for details (" + e.message + ")" });
			});
	}
}