import "./lib/browser/doc-loaded-listener";
import { FPS } from "./lib/browser/fps";
import { eventloop } from "./lib/browser/util";
import { ResponsiveWebGL, RGBAColor } from "./webgl/responsiveWebgl";
import { ge, setClass2Elms, setClassList } from "./lib/browser/dom";
import { Logger, getLogger } from "./lib/browser/logger";
import { createArrayBuffer } from "./lib/browser/webgl";
import { showError } from "./lib/common/util";
export var canvas: ResponsiveWebGL, log: Logger;
var FPSMeter = new FPS([(fps) => log({ FPS: fps })],60);
var fragS = `
void main(void) {
	gl_FragColor = vec4(0.8,gl_FragCoord.xy/vec2(500.0,500.0),1.0); //vec4(1.0, 1.0, 0.0, 1.0);
}`.split("\n").slice(1).join("\n");

var vertexS = `
attribute vec3 position;

void main(void){
	gl_Position = vec4(position, 1.0);
}`.split("\n").slice(1).join("\n");

var VBO: WebGLBuffer; // Vertex array buffer
function init() {
	log = getLogger(ge("log") as HTMLPreElement, 30, false);
	canvas = new ResponsiveWebGL(ge("c1-parent"), ge("c1") as HTMLCanvasElement, fragS, vertexS);
	const gl = canvas.gl;
	var vbo = createArrayBuffer(gl, new Float32Array([
		0.5, 0.5, 0.0,
		-0.5, 0.5, 0.0,
		0.5, -0.5, 0.0,
		-0.5, -0.5, 0.0
	]));
	if (vbo == null) { showError("死んだ"); return; }
	VBO = vbo;
	{// attribute positionとvboを結び付ける
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		var attPosLoc = gl.getAttribLocation(canvas.shaders.shaderProgram, 'position');
		gl.enableVertexAttribArray(attPosLoc);
		gl.vertexAttribPointer(attPosLoc, 3 /* VABのStride */, gl.FLOAT, false, 0, 0);
	}
	/*
	TODO
	====
	- 6x6行列を3x3行列4個で表す。
	*/
}
function onTick(ticks: number, time: number): boolean {
	//if (ticks % 60 == 0) log({ ticks, time });
	FPSMeter.tick();
	const gl = canvas.gl;
	gl.clear(canvas.gl.COLOR_BUFFER_BIT | canvas.gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	return false;
}
export function main() { eventloop(init, onTick); }