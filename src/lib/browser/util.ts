import { DOC_LOADED } from './doc-loaded-listener';
export function loadScript(src: string): Promise<{}> {
	var done = false;
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.src = src;
	head.appendChild(script);
	return new Promise((res) => {
		// @ts-ignore
		script.onload = script.onreadystatechange = () => {
			// @ts-ignore				
			if (!done && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
				done = true;
				res();
				// @ts-ignore					
				script.onload = script.onreadystatechange = null;
				if (head && script.parentNode)
					head.removeChild(script);
			}
		}
	});
}
export function URLtoObject(): { [id: string]: string } {
	var arg = {};
	var pair = location.search.substring(1).split("&");
	pair.forEach(function (V) {
		var kv = V.split("=");
		arg[kv[0]] = kv[1];
	});
	return arg;
}
export function polyfill() {
	window.performance.now = window.performance.now || function () {
		return (new Date).getTime();
	};
	(function () {
		// @ts-ignore			
		var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.requestAnimationFrame = requestAnimationFrame;
	})();
}
export function downloadText(fileName: string, text: string) {
	var a = document.createElement("a");
	a.href = window.URL.createObjectURL(new Blob([text], { type: "text/plain" }));
	a.download = fileName;
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
export function loadFileAsText(): Promise<[string, FileReader]> {
	return new Promise((res, rej) => {
		var input = document.createElement("input");
		input.type = "file";
		input.addEventListener("change", (e) => {
			// @ts-ignore				
			var file = e.target.files[0];
			if (!file) rej();
			var reader = new FileReader;
			reader.onload = (e) => {
				// @ts-ignore					
				return res(reader.result, reader);
			};
			reader.readAsText(file);
		});
		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	});
}
export function loadFileAsDataURL(): Promise<[string, FileReader]> {
	return new Promise((res, rej) => {
		var input = document.createElement("input");
		input.type = "file";
		input.addEventListener("change", (e) => {
			// @ts-ignore				
			var file = e.target.files[0];
			if (!file) rej();
			var reader = new FileReader;
			reader.onload = (e) => {
				// @ts-ignore					
				return res(reader.result, reader);
			};
			reader.readAsDataURL(file);
		});
		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	});
}
/** @param loop 0以上の整数がticksに入ります。終了したいのであればtrueを返すべきです*/
export function eventloop(load: () => void, loop: (ticks: number, time: number) => boolean) {
	var cb = () => {
		load();
		var ticks = 0;
		var startTime = performance.now();
		setTimeout(function tmp() {
			if (loop(ticks, performance.now() - startTime)) return;
			ticks++;
			requestAnimationFrame(tmp);
		}, 0);
	}
	if (DOC_LOADED) setTimeout(cb, 0);
	else window.addEventListener("load", () => cb());
}
