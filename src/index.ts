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
var programInfo: twgl.ProgramInfo, bufferInfo: twgl.BufferInfo, cubeTex: WebGLTexture;
var stereo_programInfo: twgl.ProgramInfo, stereo_bufferInfo: twgl.BufferInfo;
var framebufferInfo_left: twgl.FramebufferInfo, framebufferInfo_right: twgl.FramebufferInfo;
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
const stereo_arrays = {
	position: {
		numComponents: 2,
		data: ([] as number[]).concat([-1, -1], [-1, 1], [0, -1], [0, 1], [0, -1], [0, 1], [1, -1], [1, 1]),
		type: Float32Array
	},
	indices: {
		numComponents: 3, // Triangles
		data: ([] as number[]).concat([0, 1, 2], [1, 2, 3], [4, 5, 6], [5, 6, 7]),
		type: Uint16Array
	},
	texcoord: {
		numComponents: 3, // x,y,index 
		data: ([] as number[]).concat([0, 0, -1], [0, 1, -1], [1, 0, -1], [1, 1, -1], [0,0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1]),
		type: Float32Array
	}
};

const uniforms = {
	u_diffuse: {} as WebGLTexture, // set @ init()
	u_worldViewProjectionA: [] as number[], // mat4
	u_worldViewProjectionB: [] as number[], // vec4
	u_zRange: [] as number[], // [min,max]
	u_wRange: [] as number[], // [min,max]
	u_xyTanInv: [] as number[] // [xTan,yTan] アスペクト比とかのファクター
};
const stereo_uniforms = {
	u_texA: {} as WebGLTexture,
	u_texB: {} as WebGLTexture
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

	stereo_programInfo = twgl.createProgramInfo(gl, ["stereo-vs", "stereo-fs"]);
	stereo_bufferInfo = twgl.createBufferInfoFromArrays(gl, stereo_arrays);
	var onResize = () => {
		framebufferInfo_left = twgl.createFramebufferInfo(gl, undefined, 1024, 1024);
		framebufferInfo_right = twgl.createFramebufferInfo(gl, undefined, 1024, 1024);
	}
	onResize();
	/*((Fn) => {
		var i: number | undefined = undefined;
		window.addEventListener('resize', () => {
			if (i !== undefined) clearTimeout(i);
			i = setTimeout(Fn, 100);
		});
	})(onResize);*/
	stereo_uniforms.u_texA = framebufferInfo_left.attachments[0];
	stereo_uniforms.u_texB = framebufferInfo_right.attachments[0];
	cubeTex = twgl.createTexture(gl, {
		min: gl.NEAREST,
		mag: gl.NEAREST,
		src: [
			128, 64, 64, 255,
			64, 128, 64, 255,
			64, 64, 128, 255,
			128, 128, 128, 255
		],
	});
	uniforms.u_diffuse = cubeTex;
}
function onTick(ticks: number, time: number): boolean {
	time *= 0.001;
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	// gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	// gl.enable(gl.DEPTH_TEST);
	// gl.enable(gl.CULL_FACE); // TODO: Performance issue
	gl.enable(gl.BLEND);
	//gl.blendFunc(gl.ONE, gl.ZERO);
	gl.blendFunc(gl.ONE, gl.ONE);
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const fov = 120 * Math.PI / 180;
	const aspect = (gl.canvas.clientWidth / 2) / gl.canvas.clientHeight;

	// x, y, z, w, 1 -> x', y', z', w'
	let tmpMat = new M(5).getId()
		.mulMat(new M(5).getRot(0, 1, Math.PI / 12))
		.mulMat(new M(5).getRot(1, 2, Math.PI / 12))
		.mulMat(new M(5).getRot(2, 0, Math.PI / 12))
		//.mulMat(new M(5).getRot(2, 3, Math.PI / 12))
		.mulMat(new M(5).getRot(0, 2, time))
		// .mulMat(new M(5).getRot(0, 3, time))
		.mulMat(new M(5).getRot(1, 3, time))
		.scale(new V(5, [1, 1, 1, 1, 1]))
		.transform(new V(5, [-1, 0/*(time % 10) * 6 - 30*/, 3, 3.7, 0]));
	//--------------------------------------------- x1 x2 y1 y2
	uniforms.u_worldViewProjectionA = tmpMat.slice(0, 3, 0, 3);
	uniforms.u_worldViewProjectionB = tmpMat.slice(4, 4, 0, 3);
	uniforms.u_zRange = [0.1, 10];
	uniforms.u_wRange = [0.1, 10];
	const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
	uniforms.u_xyTanInv = [f * aspect, f];
	tmmmm = uniforms;
	tmmmm.mat = tmpMat.clone();

	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

	// Draw Left
	twgl.bindFramebufferInfo(gl, framebufferInfo_left);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	twgl.setUniforms(programInfo, uniforms);
	gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

	// Draw Right
	tmpMat.transform(new V(5, [1, 0, 0, 0, 0]));
	//--------------------------------------------- x1 x2 y1 y2
	uniforms.u_worldViewProjectionA = tmpMat.slice(0, 3, 0, 3);
	uniforms.u_worldViewProjectionB = tmpMat.slice(4, 4, 0, 3);
	twgl.bindFramebufferInfo(gl, framebufferInfo_right);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	twgl.setUniforms(programInfo, uniforms);
	gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
	// Draw Main
	gl.useProgram(stereo_programInfo.program);
	twgl.setBuffersAndAttributes(gl, stereo_programInfo, stereo_bufferInfo);
	twgl.bindFramebufferInfo(gl, undefined);
	twgl.setUniforms(stereo_programInfo, stereo_uniforms);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.drawElements(gl.TRIANGLES, stereo_bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

	FPSMeter.tick();
	return false;
}
export function main() { eventloop(init, onTick); }
