import { getLogger } from "../logging";
import { isLoggedIn } from "../state";
import { getAnonymousToken } from "./helpers";

const logger = getLogger('api:gqlRealtime');

let websocket: WebSocket | null = null;
let hasConnectionInitialized: boolean = false;
let isClosedIntentionally = false;

const activeSubscriptions = new Map<string, {
	id: string;
	callback: (event: any) => void;
	payload: any;
}>();


function initSocket() {
	if (websocket && (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING)) {
		return;
	}

	logger.log("Starting socket...");
	hasConnectionInitialized = false;
	isClosedIntentionally = false;

	websocket = new WebSocket("wss://gql-realtime.reddit.com/query", "graphql-ws");
	websocket.onmessage = handleSocketMessage;
	websocket.onopen = async function() {
		this.send(JSON.stringify({
			type: "connection_init",
			payload: {
				headers: {
					Authorization: `Bearer ${await (isLoggedIn.value ? window.getToken : getAnonymousToken)()}`,
				},
			},
		}));
	}
	websocket.onclose = () => {
		if (!isClosedIntentionally && activeSubscriptions.size !== 0) initSocket();
	}
}

function handleSocketMessage(event: MessageEvent) {
	const data = JSON.parse(event.data);
	switch (data.type) {
		case "connection_ack":
			logger.log("Started gql socket");
			hasConnectionInitialized = true;
			for (const { id, payload } of activeSubscriptions.values()) {
				websocket?.send(JSON.stringify({
					id,
					type: "start",
					payload
				}));
			}
			break;
		case "data":
			const subscription = activeSubscriptions.get(data.id);
			if (subscription) {
				subscription.callback(data.payload.data);
			}
			break;
		case "error":
			logger.err(`Error(s) with gql subscription: ${JSON.stringify(data.payload.errors)}`, true, data);
			logger.err(`Created with: ${JSON.stringify(activeSubscriptions.get(data.id)?.payload)}`, true);
			activeSubscriptions.delete(data.id);
			break;
		case "complete":
			activeSubscriptions.delete(data.id);
			break;
		case "ka":
			break;
		default:
			logger.err("Unhandled WebSocket message type:", data.type, data);
	}
}


export function subscribe<T = any>({ operationName, query, variables, id }: {
	id: string;
	operationName: string;
	query: string;
	variables: any;
}, callback: (message: T) => void) {
	if (activeSubscriptions.has(id)) {
		logger.wrn(`Not starting subscription ${operationName} ${JSON.stringify(variables)}`);
		return;
	}

	logger.log(`Starting subscription ${operationName} ${JSON.stringify(variables)}`);
	const payload = { operationName, query, variables };
	activeSubscriptions.set(id, { id, callback, payload });

	initSocket();
	if (websocket && hasConnectionInitialized) {
		websocket.send(JSON.stringify({
			id,
			type: "start",
			payload
		}));
	}
}

export function unsubscribe(id: string) {
	if (activeSubscriptions.has(id) && hasConnectionInitialized && websocket) {
		activeSubscriptions.delete(id);
		websocket.send(JSON.stringify({
			type: "stop",
			id
		}));
	}
	/* if (activeSubscriptions.size === 0) {
		logger.log("Closing gql socket as there are no subscriptions");
		isClosedIntentionally = true;
		websocket?.close();
	} */
}

(window as any).gqlSubscribe = subscribe;
(window as any).gqlUnsubscribe = unsubscribe;