import * as toaster from "./toast";

type LogLevel = "dbg" | "inf" | "log" | "wrn" | "err" | "crt";

const logFuncMap: { [K in LogLevel]: (...data: any) => void } = {
		dbg: console.debug,
		inf: console.info,
		log: console.log,
		wrn: console.warn,
		err: console.error,
		crt: console.error,
	},
	logBGColorMap: { [K in LogLevel]: string } = {
		dbg: "#555",
		inf: "#0cf",
		log: "#fff",
		wrn: "#ff0",
		err: "#f00",
		crt: "#700",
	},
	logColorMap: { [K in LogLevel]: string } = {
		dbg: "#fff",
		inf: "#000",
		log: "#000",
		wrn: "#000",
		err: "#fff",
		crt: "#fff",
	};

function log({ level = "log", msg, func }: { level: LogLevel; msg: string; func: string }, ...args: any[]) {
	logFuncMap[level](
		"%c[" + func + "] %c" + level + "%c " + msg,
		"font-weight: bold",
		"font-weight: bold; padding: 1px 3px; border-radius: 4px; background: " + logBGColorMap[level] + "; color: " + logColorMap[level],
		"",
		...args
	);
}


class Logger {
	private funcName: string;
	constructor(funcName: string) {
		this.funcName = funcName;
	}
	public dbg(msg: string, ...args: any[]) {
		log({ level: "dbg", msg, func: this.funcName }, ...args);
		// toaster.showToast({ type: toaster.ToastType.Custom, text: `(${this.funcName}) ${msg}` }, 1500);
	}
	public inf(msg: string, withToast = true, ...args: any[]) {
		log({ level: "inf", msg, func: this.funcName }, ...args);
		withToast && toaster.showToast({ kind: toaster.ToastType.SuccessCommunityGreen, text: `[${this.funcName}] ${msg}` }, 1000);
	}
	public log(msg: string, withToast = false, ...args: any[]) {
		log({ level: "log", msg, func: this.funcName }, ...args);
		withToast && toaster.showToast({ kind: toaster.ToastType.SuccessCommunity, text: `[${this.funcName}] ${msg}` }, 1000);
	}
	public wrn(msg: string, withToast = true, ...args: any[]) {
		log({ level: "wrn", msg, func: this.funcName }, ...args);
		withToast && toaster.showToast({ kind: toaster.ToastType.Error, text: `[${this.funcName}] ${msg}` }, 4000);
	}
	public err(msg: string, withToast = true, ...args: any[]) {
		log({ level: "err", msg, func: this.funcName }, ...args);
		withToast && toaster.showToast({ kind: toaster.ToastType.Error, text: `[${this.funcName}] ${msg}` }, 4000);
	}
	public crt(msg: string, ...args: any[]) {
		log({ level: "crt", msg, func: this.funcName }, ...args);
		toaster.showToast({ kind: toaster.ToastType.Error, text: `[${this.funcName}] ${msg}` }, 0);
	}
	public exception(msg: string, ...args: any[]) {
		this.crt(msg, ...args);
		return new Error(msg);
	}
}


export function getLogger(funcName: string) {
	return new Logger(funcName);
}