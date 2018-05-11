import { initWebGL, initShaders } from "../lib/browser/webgl";
import { showError } from "../lib/common/util";

export interface RGBAColor {
	R: number,
	G: number,
	B: number,
	A: number
}
export class ResponsiveWebGL {
	parent: HTMLElement
	canvas: HTMLCanvasElement
	scaleX: number
	scaleY: number
	gl: WebGLRenderingContext
	shaders: { frag: WebGLShader, vertex: WebGLShader, shaderProgram: WebGLProgram }
	constructor(parent: HTMLElement, canvas: HTMLCanvasElement, fragS: string, vertexS: string, clearColor: RGBAColor = { R: 0.0, G: 0.0, B: 0.0, A: 1.0 }) {
		this.parent = parent;
		this.canvas = canvas;
		if (!canvas.getContext) throw "Canvasが対応していないようです";
		var gl = initWebGL(canvas);
		if (gl == null) {
			showError("WebGLは使えません。フォールバックもありません。死んでます。ほかのブラウザーをお試しください。");
			return;
		}
		this.gl = gl;
		gl.clearColor(clearColor.R, clearColor.G, clearColor.B, clearColor.A); // clearColorの設定
		gl.enable(gl.DEPTH_TEST); // Do it once
		gl.depthFunc(gl.LEQUAL); // Do it once
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var shaders = initShaders(gl, fragS, vertexS);
		if (shaders.fragS == null || shaders.vertexS == null || shaders.shaderProgram == null) throw "Shaderの初期化に失敗";
		this.shaders = { frag: shaders.fragS, vertex: shaders.vertexS, shaderProgram: shaders.shaderProgram };
		{
			this.scaleX = 1;
			this.scaleY = 1;
			var This = this;
			((Fn) => {
				var i: number | undefined = undefined;
				window.addEventListener('resize', () => {
					if (i !== undefined) clearTimeout(i);
					i = setTimeout(Fn, 100);
				});
			})(() => this.onResize.call(This));
			this.onResize();
		}// To be resizable
	}
	onResize() {
		let Canvas = this.canvas;
		this.scaleX = this.parent.clientWidth;
		this.scaleY = this.parent.clientHeight;
		Canvas.width = this.scaleX << 0;
		Canvas.height = this.scaleY << 0;
		Canvas.style.width = this.parent.clientWidth + "px";
		Canvas.style.height = this.parent.clientHeight + "px";
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}
}