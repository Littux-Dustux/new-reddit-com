class DummyWebSocket {
	constructor(url) {
		this.url = url;
		this.readyState = 0;
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
	}
	send(data) {
		console.warn("Blocked WS Send:", data);
	}
	close() {
		this.readyState = 3;
	}
};

Object.assign(DummyWebSocket, {
	CONNECTING: 0,
	OPEN: 1,
	CLOSING: 2,
	CLOSED: 3,
});

if (location.host === "new-reddit-com.netlify.app") {
	(window as any).WebSocket = DummyWebSocket;
}