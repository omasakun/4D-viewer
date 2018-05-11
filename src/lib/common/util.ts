export function dateFormat(date: Date): string {
	var y = date.getFullYear();
	var m = padLeft((date.getMonth() + 1).toString(), 2, " ");
	var d = padLeft(date.getDate().toString(), 2, " ");
	var h = padLeft(date.getHours().toString(), 2, " ");
	var min = padLeft(date.getMinutes().toString(), 2, " ");
	var s = padLeft(date.getSeconds().toString(), 2, " ");
	return y + "/" + m + "/" + d + " " + h + ":" + min + ":" + s;
}
export function timeFormat(date: Date): string {
	var h = padLeft(date.getHours().toString(), 2, " ");
	var min = padLeft(date.getMinutes().toString(), 2, " ");
	var s = padLeft(date.getSeconds().toString(), 2, " ");
	return h + ":" + min + ":" + s;
}
export function mapValue(value: number, min1: number, max1: number, min2: number, max2: number) {
	return (value - min1) / (max1 - min1) * (max2 - min2) + min2;
}
export function showError(message: string): never {
	console.error(message);
	if (typeof (alert) == "function")
		alert(message);
	throw message;
}
export function strRight(str: string, len: number) {
	return str.substr(str.length - len);
}
export function padLeft(str: string, len: number, pad: string) {
	return pad.charAt(0).repeat(len - str.length) + str;
}