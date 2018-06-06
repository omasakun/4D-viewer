import { timeFormat } from "../common/util";
export type Logger = (...objects: any[]) => void;
export function getLogger(logElm: HTMLPreElement, maxLen: number, log2console = true): Logger {
	var output: string[] = [];
	return (...objects: any[]) => {
		if (log2console) console.log(objects.length == 1 ? objects[0] : objects);
		var prefix = `${timeFormat(new Date())}`;
		var blanks = " ".repeat(prefix.length);
		for (let i = 0; i < objects.length; i++) {
			const obj = objects[i];
			var appendText = "";
			if (typeof obj == "string") appendText = obj;
			else if (typeof obj == "object") {
				for (const key in obj) if (obj.hasOwnProperty(key))
					appendText += `[${key}|${JSON.stringify(obj[key])}]`;
			} else appendText = JSON.stringify(obj);
			output.unshift(`${i == 0 ? prefix : blanks} ${appendText}`);
			// output.push(`${i == 0 ? prefix : blanks} ${appendText}`);
		}
		output = output.slice(0, maxLen);
		logElm.innerText = output.join("\n");
		// logElm.innerText = output.slice(Math.max(0, output.length - maxLen)).join("\n");
	}
}