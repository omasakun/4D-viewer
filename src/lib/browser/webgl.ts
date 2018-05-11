import { showError } from "../common/util";

export function initWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
	var gl: null | WebGLRenderingContext = null;
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch (e) { }
	if (!gl) {
		gl = null;
	}
	return gl;
}
function getFragShader(gl: WebGLRenderingContext, text: string): WebGLShader | null {
	var shader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shader, text);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		showError(`シェーダーのコンパイルでエラー [Message|${gl.getShaderInfoLog(shader)}]`);
		return null;
	}
	return shader;
}
function getVertexShader(gl: WebGLRenderingContext, text: string): WebGLShader | null {
	var shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shader, text);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		showError(`シェーダーのコンパイルでエラー [Message|${gl.getShaderInfoLog(shader)}]`);
		return null;
	}
	return shader;
}
export function initShaders(gl: WebGLRenderingContext, fragShaderText: string, vertexShaderText: string) {
	var vertexS = getVertexShader(gl, vertexShaderText);
	var fragS = getFragShader(gl, fragShaderText);
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexS);
	gl.attachShader(shaderProgram, fragS);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) showError(`シェーダープログラムを初期化できません [Message|${gl.getProgramInfoLog(shaderProgram)}]`);
	gl.useProgram(shaderProgram);
	return { fragS, vertexS, shaderProgram };
}
export function createArrayBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null {
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return vbo;
}
export function createIBO(gl: WebGLRenderingContext, data: Int16Array) {
	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	return ibo;
}
export function createTexture(gl: WebGLRenderingContext, source: string, fn: (texture: WebGLTexture | null) => void) {
	var img = new Image();
	img.onload = () => {
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); // テクスチャへイメージを適用
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		fn(tex);
	};
	img.src = source;
}