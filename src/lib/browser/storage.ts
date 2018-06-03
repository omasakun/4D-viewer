import { loadScript } from "../browser/util";

namespace GASStorage {
	const macroPath = "https://script.google.com/macros/s/AKfycbxe3u2ZvvkLhuOhL4pLRQLfHaSIUFWAgDbNrbdBtWOdd_IUu5CW/exec";
	var titles: string[] | undefined = undefined
	var _rank: string[] = []
	function onTitleLoaded(names: string[]) {
		titles = names.map((v) => decodeURIComponent(v[0]));
	}
	function onDataLoaded(names: string[]) {
		_rank = names.map((v) => JSON.parse(decodeURIComponent(v[0])));
	}
	export function init() {
		window["MyStorage_onTitleLoaded"] = onTitleLoaded;
		window["MyStorage_onDataLoaded"] = onDataLoaded;
	}
	export function get(title: string, cb: (data: string[]) => void) {
		let titleIndex = !titles ? -1 : titles.findIndex(v => v == title);
		if (titleIndex >= 0)	
			loadScript(`${macroPath}?id=${titleIndex}&prefix=MyStorage_onDataLoaded`).then(() => cb(_rank));
		else {
			loadScript(`${macroPath}?type=getTitle&prefix=MyStorage_onTitleLoaded`).then(() => {
				let titleIndex = !titles ? -1 : titles.findIndex(v => v == title);
				if (titleIndex < 0) cb([]); // title not found.
				else loadScript(`${macroPath}?id=${titleIndex}&prefix=MyStorage_onDataLoaded`).then(() => cb(_rank));
			});
		}
	}
	export function add(title: string, data: string, cb: () => void) {
		let titleIndex = !titles ? -1 : titles.findIndex(v => v == title);
		if (titleIndex >= 0)
			loadScript(`${macroPath}?type=addData&id=${titleIndex}&text=${encodeURIComponent(JSON.stringify(data))}`).then(() => cb());
		else {
			loadScript(`${macroPath}?type=getTitle&prefix=MyStorage_onTitleLoaded`).then(() => {
				let titleIndex = !titles ? -1 : titles.findIndex(v => v == title);
				if (titleIndex < 0) {
					titles!.push(encodeURIComponent(title));
					loadScript(`${macroPath}?type=addTitle&title=${encodeURIComponent(title)}&text=${encodeURIComponent(JSON.stringify(data))}`).then(() => cb());
				} else loadScript(`${macroPath}?type=addData&id=${titleIndex}&text=${encodeURIComponent(JSON.stringify(data))}`).then(() => cb());
			});
		}
	}
};
GASStorage.init();