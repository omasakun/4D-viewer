export interface FPSListeners {
	span: number,
	fn: ((fps: number) => void)[]
}
export class FPS {
	listeners: FPSListeners;
	private prev = 0;
	private fCount = -1;
	private cFPS = 60;
	constructor(fn: ((fps: number) => void)[] = [(fps) => fps < 50 ? console.log(`[FPS|${fps}]`) : 0], span: number = 100) {
		this.listeners = { span: span, fn: fn };
	}
	currentFPS() {
		return this.cFPS;
	}
	tick() {
		if (this.fCount < 0) {
			this.prev = performance.now();
			this.fCount++;
			return;
		}
		this.fCount++;
		if (this.fCount % this.listeners.span == 0) {
			var now = performance.now();
			this.fCount = 0;
			this.cFPS = (1000 / (now - this.prev) * this.listeners.span) << 0;
			this.prev = now;
			this.listeners.fn.forEach((v) => v(this.cFPS));
		}
	}
}