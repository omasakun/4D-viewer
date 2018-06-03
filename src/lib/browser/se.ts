import { showError } from "../common/util";

export class SEManager {
	private audio: Map<string, HTMLAudioElement> = new Map();
	private pendingAudio: { key: string, audio: HTMLAudioElement }[] = []
	constructor(pathes: Map<string, string>, setHandler2Load: (fn: () => void) => void, onLoaded: () => void) {
		let loadedCount = pathes.size;
		pathes.forEach((path, key) => {
			let audio = new Audio(path);
			audio.play();
			if (audio.paused) {
				var self = this;
				this.pendingAudio.push({ key: key, audio: audio });
			} else {
				loadedCount--;
				if (loadedCount == 0)
					onLoaded();
			}
			audio.pause();
			this.audio.set(key, audio);
		});
		if (this.pendingAudio.length > 0) {
			let self = this;
			setHandler2Load(() => {
				for (let i = 0; i < this.pendingAudio.length; i++) {
					self.pendingAudio[i].audio.play();
					if (self.pendingAudio[i].audio.paused) showError("Cannot Play SE!");
					self.pendingAudio[i].audio.pause();
					//self.pendingAudio[i].addEventListener("canplay", () => {
					loadedCount--;
					if (loadedCount == 0)
						onLoaded();
					//})
				}
				this.pendingAudio = [];
			});
		}
	}
	play(key: string): boolean {
		var tmp = this.get(key);
		if (tmp == undefined) return false;
		tmp.pause();
		tmp.currentTime = 0;
		tmp.play();
		return true;
	}
	get(key: string) {
		var tmp = this.audio.get(key);
		if (tmp == undefined) showError(`Unloaded SE [Key|${key}]`);
		else {
			return tmp;
		}
		return undefined;
	}
}