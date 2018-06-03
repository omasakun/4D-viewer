import "./lib/browser/doc-loaded-listener";
import { FPS } from "./lib/browser/fps";
import { eventloop } from "./lib/browser/util";
import { ge, setClass2Elms, setClassList } from "./lib/browser/dom";
import { Logger, getLogger } from "./lib/browser/logger";
import { initWebGL } from "./lib/browser/webgl";
import { showError } from "./lib/common/util";
import { Matrix, Vector } from "./lib/common/matrix-vector";
import { twgl } from "../node_modules/@types/twgl.js/index"; // http://twgljs.org/docs/


//@ts-ignore // Force to load twgl.js
twgl = window["twgl"] as any;

export var gl: WebGLRenderingContext, canvas: HTMLCanvasElement, canvasParent: HTMLDivElement, log: Logger, M = Matrix, V = Vector, tmmmm;
var programInfo: twgl.ProgramInfo, bufferInfo: twgl.BufferInfo, tex: WebGLTexture;
var FPSMeter = new FPS([(fps) => log({ FPS: fps })], 60);
function nA(len: number) {
	return ".".repeat(len).split("");
}
const dim = 4;
const arrays = {
	position: {
		numComponents: dim,
		data: ([] as number[]).concat(...nA(dim * dim).map((_, i) => nA(dim).map((_, j) => i & (1 << j) ? 1 : -1))), // TODO: High cost
		type: Float32Array
	},
	indices: {
		numComponents: 3, // Triangles
		data: (() => {
			var result: number[][] = [];
			for (let i = 0; i < dim * dim; i++)
				for (let j = 0; j < dim; j++)
					for (let k = j + 1; k < dim; k++)
						if ((i & (1 << j)) == 0 && (i & (1 << k)) == 0 && i + (1 << k) + (1 << j) < (1 << dim)) {
							result.push([i, i + (1 << j), i + (1 << k)]);
							// console.log((32 + i).toString(2), j, k, "-", i, i + (1 << j), i + (1 << k));
							result.push([i + (1 << k) + (1 << j), i + (1 << k), i + (1 << j)]);
						}
			return ([] as number[]).concat(...result);
		})(),
		type: Uint16Array
	},
	texcoord: {
		numComponents: 2,
		data: ([] as number[]).concat(...nA(dim * dim).map((_, i) => {
			var tmp = nA(dim).map((_, j) => i & (1 << j) ? 1 : 0);//.reduce((pv, cv) => pv + cv, 0) % 4;
			// console.log(tmp); // TODO: テクスチャのつなぎ目が見える件について
			return [(tmp[0] + tmp[2]) & 1, (tmp[1] + tmp[2]) & 1];
		})),
		type: Float32Array
	}
};
// console.log(arrays);
const uniforms = {
	u_diffuse: {} as WebGLTexture, // set @ init()
	u_worldViewProjection: {} as twgl.Mat4
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
	console.log(bufferInfo);
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
	// gl.enable(gl.DEPTH_TEST);
	// gl.enable(gl.CULL_FACE); // TODO: Performance issue
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const fov = 60 * Math.PI / 180;
	const aspect = gl.canvas.clientHeight / gl.canvas.clientWidth;

	/*const zNear = 0.5;
	const zFar = 10;
	const projection = twgl.m4.perspective(fov, aspect, zNear, zFar);
	const eye = [1, 4, -6];
	const target = [0, 0, 0];
	const up = [0, 1, 0];
	const camera = twgl.m4.lookAt(eye, target, up);
	const view = twgl.m4.inverse(camera);
	const viewProjection = twgl.m4.multiply(projection, view);
	const world = twgl.m4.rotationY(time);
	uniforms.u_worldViewProjection = twgl.m4.multiply(viewProjection, world);*/
	uniforms.u_worldViewProjection = new M(5).getId()
		.mulMat(new M(5).getRot(0, 1, Math.PI / 12))
		.mulMat(new M(5).getRot(1, 2, Math.PI / 12))
		.mulMat(new M(5).getRot(2, 0, Math.PI / 12))
		.mulMat(new M(5).getRot(0, 2, time))
		.transform(new V(5, [0, 0, -5, 0, 0]))
		.mulMat(new M(5).getPerspective(2, fov, [aspect], 0.1, 10))
		.mapping(4,"01245679ABCEFGHJ")
		.data;
	tmmmm = new M(4, uniforms.u_worldViewProjection);
	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniforms);
	gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

	FPSMeter.tick();
	return false;
}
export function main() { eventloop(init, onTick); }
