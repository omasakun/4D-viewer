export class ResponsiveCanvas {
	parent: HTMLElement
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	scaleX: number
	scaleY: number
	dpr: number
	/** @throws {string} "Canvasが対応していないようです"	 */
	constructor(parent: HTMLElement, canvas: HTMLCanvasElement, dpr: number|undefined = undefined) {
		this.parent = parent;
		this.canvas = canvas;
		if (canvas.getContext) this.ctx = canvas.getContext('2d')!;
		else throw "Canvasが対応していないようです";
		this.scaleX = 1;
		this.scaleY = 1;
		this.dpr = (dpr || window.devicePixelRatio || 1);
		var This = this;
		((Fn) => {
			var i: number | undefined = undefined;
			window.addEventListener('resize', () => {
				if (i !== undefined) clearTimeout(i);
				i = setTimeout(Fn, 100);
			});
		})(() => this.onResize.call(This));
		this.onResize();
	}
	changeDPR(dpr: number) {
		this.dpr = dpr || this.dpr;
		this.onResize();
		console.log(`[DPR: ${dpr}/${(window.devicePixelRatio || 1)}`);
	}
	onResize() {
		let Canvas = this.ctx.canvas;
		this.scaleX = this.dpr* this.parent.clientWidth;
		this.scaleY = this.dpr* this.parent.clientHeight;
		Canvas.width = this.scaleX << 0;
		Canvas.height = this.scaleY << 0;
		Canvas.style.width = this.parent.clientWidth + "px";
		Canvas.style.height = this.parent.clientHeight + "px";
		this.ctx.lineWidth = this.dpr;
	}
	line(x1, y1, x2, y2) {
		this.ctx.moveTo((x1 * this.scaleX) << 0, (y1 * this.scaleY) << 0);
		this.ctx.lineTo((x2 * this.scaleX) << 0, (y2 * this.scaleY) << 0);
	}
	rect(x, y, w, h) {
		this.ctx.rect(
			(x * this.scaleX) << 0, (y * this.scaleY) << 0,
			(w * this.scaleX) << 0, (h * this.scaleY) << 0
		);
	}
	round(x, y, r) {
		this.ctx.arc((x * this.scaleX) << 0, (y * this.scaleY) << 0, (r * Math.min(this.scaleX, this.scaleY)) << 0, -0.5 * Math.PI, 2 * Math.PI);
	}
	longRound(x, y, h, r) {
		this.ctx.arc((x * this.scaleX) << 0, (y * this.scaleY) << 0, (r * Math.min(this.scaleX, this.scaleY)) << 0, -Math.PI, 0);
		this.ctx.arc((x * this.scaleX) << 0, ((y + h) * this.scaleY) << 0, (r * Math.min(this.scaleX, this.scaleY)) << 0, 0, -Math.PI);
		this.ctx.lineTo((x * this.scaleX - r * Math.min(this.scaleX, this.scaleY)) << 0, (y * this.scaleY) << 0);
	}
	beginPath() { this.ctx.beginPath() }
	fillAll(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.fillStyle = style;
		this.ctx.fillRect(0, 0, this.scaleX << 0, this.scaleY << 0);
	}
	fill(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.fillStyle = style;
		this.ctx.fill();
	}
	stroke(style: undefined | string = undefined) {
		if (style !== undefined) this.ctx.strokeStyle = style;
		this.ctx.stroke();
	}
	clearAll() {
		this.ctx.clearRect(0, 0, this.scaleX, this.scaleY);
	}
}