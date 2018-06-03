//// <reference path="../node_modules/@types/twgl.js/index.d.ts" /> 
import "./lib/browser/doc-loaded-listener";
import { FPS } from "./lib/browser/fps";
import { eventloop } from "./lib/browser/util";
import { ge, setClass2Elms, setClassList } from "./lib/browser/dom";
import { Logger, getLogger } from "./lib/browser/logger";
import { initWebGL } from "./lib/browser/webgl";
import { showError } from "./lib/common/util";
import { Matrix,Vector } from "./matrix-vector";

//import { twgl } from "../node_modules/@types/twgl.js/index"; // http://twgljs.org/docs/ */
export var gl: WebGLRenderingContext, canvas: HTMLCanvasElement, canvasParent: HTMLDivElement, log: Logger,mat=Matrix,vec=Vector;
var programInfo: twgl.ProgramInfo, bufferInfo: twgl.BufferInfo, tex: WebGLTexture;
var FPSMeter = new FPS([(fps) => log({ FPS: fps })], 60);
const arrays = {
	position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
	texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
	indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
};
const uniforms = {
	u_diffuse: {} as WebGLTexture // set @ init()
};

function init() {
	log = getLogger(ge("log") as HTMLPreElement, 30, false);
	canvasParent = ge("c1-parent") as HTMLDivElement;
	canvas = ge("c1") as HTMLCanvasElement;
	if (!canvas.getContext) throw "Canvasが対応していないようです";
	{
		let _gl = initWebGL(canvas);
		if (_gl == null) {
			showError("WebGLは使えません。フォールバックもありません。死んでます。ほかのブラウザーをお試しください。");
			return;
		}
		gl = _gl;
	}
	programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
	bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
	tex = twgl.createTexture(gl, {
		min: gl.NEAREST,
		mag: gl.NEAREST,
		src: [
			128, 64, 64, 255,
			64, 128, 64, 255,
			64, 64, 128, 255,
			128, 128, 128, 255
		],
	});
	uniforms.u_diffuse = tex;
	/*
	TODO
	====
	- 6x6行列を3x3行列4個で表す。
	- レンズの歪み https://webgl.souhonzan.org/entry/?v=0335
	- https://wgld.org/d/webgl/w013.html == https://wgld.org/j/minMatrix.js
	*/
}
function onTick(ticks: number, time: number): boolean {

	time *= 0.001;
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const fov = 30 * Math.PI / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.5;
	const zFar = 10;
	const projection = twgl.m4.perspective(fov, aspect, zNear, zFar);
	const eye = [1, 4, -6];
	const target = [0, 0, 0];
	const up = [0, 1, 0];
	const camera = twgl.m4.lookAt(eye, target, up);
	const view = twgl.m4.inverse(camera);
	const viewProjection = twgl.m4.multiply(projection, view);
	const world = twgl.m4.rotationY(time);
	uniforms.u_worldViewProjection = twgl.m4.multiply(viewProjection, world);
	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniforms);
	gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

	FPSMeter.tick();
	return false;
}
export function main() { eventloop(init, onTick); }