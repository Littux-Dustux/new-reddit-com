export type InterceptorHandler = (
	requestDetails: { url: string, domain: string, method: string, headers: Record<string, any> }, data: any
) => Promise<{
	jsonResponse: string,
	status: number,
	headers?: Record<string, string>
}>;


const interceptorRegistry = new Map<string, Map<string, InterceptorHandler>>();

export function addInterceptor(domain: string, method: string, handler: InterceptorHandler): void {
    if (!interceptorRegistry.has(domain)) {
        interceptorRegistry.set(domain, new Map());
    }
    interceptorRegistry.get(domain)!.set(method, handler);
}

// Make it globally available
(window as any).addInterceptor = addInterceptor;


async function createFakeXHR(xhr: XMLHttpRequest, data: any, handler: InterceptorHandler): Promise<void> {
	const {
		jsonResponse,
		status,
		headers = {
			"content-type": "application/json; charset=utf-8",
		}
	} = await handler(
		{
			url: (xhr as any)._url,
			domain: (xhr as any)._domain,
			method: (xhr as any)._method,
			headers: (xhr as any)._headers
		},
		data
	);

	// Superagent checks these specifically
	Object.defineProperties(xhr, {
		status: { value: status || 200 },
		statusText: { value: "OK" },
		readyState: { value: 4 },
		responseText: { value: jsonResponse },
		response: { value: jsonResponse },
		// Superagent uses this to decide if the request was successful
		responseURL: { value: (xhr as any)._url },
		withCredentials: { value: true },
	});

	// Superagent won't parse the body unless it sees this header
	xhr.getResponseHeader = function (header: string): string | null {
		return headers[header.toLowerCase()] || null;
	};

	xhr.getAllResponseHeaders = function (): string {
		return "Content-Type: application/json; charset=utf-8\r\nCache-Control: no-cache\r\n";
	};

	// Manually trigger the progress and load events in order
	xhr.dispatchEvent(new Event("loadstart"));
	xhr.dispatchEvent(new Event("progress"));
	xhr.dispatchEvent(new Event("readystatechange"));
	xhr.dispatchEvent(new Event("load"));
	xhr.dispatchEvent(new Event("loadend"));
}


const OldXHR = window.XMLHttpRequest;

function NewXHR(): XMLHttpRequest {
	const xhr = new OldXHR();
	(xhr as any)._headers = {};

	const setRequestHeader = xhr.setRequestHeader.bind(xhr);
	xhr.setRequestHeader = function (header: string, value: string): void {
		(xhr as any)._headers[header] = value;
		return setRequestHeader(header, value);
	}

	const send = xhr.send.bind(xhr);
	xhr.send = function (data: any): void {
		if ((this as any)._url) {
			const isAbsolute = (this as any)._url.startsWith('http');
			const domain = isAbsolute
				? new URL((this as any)._url).hostname
				: (this as any)._url.startsWith('//')
					? new URL("https:"+(this as any)._url).hostname
					: "/";

			(xhr as any)._domain = domain;

			const domainMap = interceptorRegistry.get(domain);
			if (domainMap) {
				let handler = domainMap.get((this as any)._method);
				if (!handler) {
					handler = domainMap.get('*'); // wildcard for any method
				}
				if (handler) {
					createFakeXHR(this, data, handler);
					return;
				}
			}
		}
		return send(data);
	};

	// We need to capture the URL from the .open() call
	const open = xhr.open.bind(xhr);
	xhr.open = function (method: string, url: string | URL): void {
		(this as any)._url = url.toString();
		(this as any)._method = method;
		return open(method, url);
	};

	return xhr;
}

// @ts-ignore
window.XMLHttpRequest = NewXHR;