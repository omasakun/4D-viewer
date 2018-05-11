import { initWebGL } from "../lib/browser/webgl";
import { showError } from "../lib/common/util";

export class TrainingWebGL {
	gl: WebGLRenderingContext
	constructor(canvas: HTMLCanvasElement, clearColorR: number = 0.0, clearColorG: number = 0.0, clearColorB: number = 0.0, clearColorA: number = 1.0) {
		var gl = initWebGL(canvas);
		if (gl == null) {
			showError("WebGLは使えません。フォールバックもありません。死んでます。ほかのブラウザーをお試しください。");
			return;
		}
		gl.clearColor(clearColorR, clearColorG, clearColorB, clearColorA); // clearColorの設定
    gl.enable(gl.DEPTH_TEST); // Do it once
    gl.depthFunc(gl.LEQUAL); // Do it once
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
}