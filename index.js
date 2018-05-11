define("lib/browser/doc-loaded-listener", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DOC_LOADED = false || exports.DOC_LOADED == true;
    window.addEventListener("load", () => exports.DOC_LOADED = true);
});
define("lib/browser/fps", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FPS {
        constructor(fn = [(fps) => fps < 50 ? console.log(`[FPS|${fps}]`) : 0], span = 100) {
            this.prev = 0;
            this.fCount = -1;
            this.cFPS = 60;
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
    exports.FPS = FPS;
});
define("lib/browser/util", ["require", "exports", "lib/browser/doc-loaded-listener"], function (require, exports, doc_loaded_listener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadScript(src) {
        var done = false;
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.src = src;
        head.appendChild(script);
        return new Promise((res) => {
            script.onload = script.onreadystatechange = () => {
                if (!done && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
                    done = true;
                    res();
                    script.onload = script.onreadystatechange = null;
                    if (head && script.parentNode)
                        head.removeChild(script);
                }
            };
        });
    }
    exports.loadScript = loadScript;
    function URLtoObject() {
        var arg = {};
        var pair = location.search.substring(1).split("&");
        pair.forEach(function (V) {
            var kv = V.split("=");
            arg[kv[0]] = kv[1];
        });
        return arg;
    }
    exports.URLtoObject = URLtoObject;
    function polyfill() {
        window.performance.now = window.performance.now || function () {
            return (new Date).getTime();
        };
        (function () {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
            window.requestAnimationFrame = requestAnimationFrame;
        })();
    }
    exports.polyfill = polyfill;
    function downloadText(fileName, text) {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([text], { type: "text/plain" }));
        a.download = fileName;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    exports.downloadText = downloadText;
    function loadFileAsText() {
        return new Promise((res, rej) => {
            var input = document.createElement("input");
            input.type = "file";
            input.addEventListener("change", (e) => {
                var file = e.target.files[0];
                if (!file)
                    rej();
                var reader = new FileReader;
                reader.onload = (e) => {
                    return res(reader.result, reader);
                };
                reader.readAsText(file);
            });
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    }
    exports.loadFileAsText = loadFileAsText;
    function loadFileAsDataURL() {
        return new Promise((res, rej) => {
            var input = document.createElement("input");
            input.type = "file";
            input.addEventListener("change", (e) => {
                var file = e.target.files[0];
                if (!file)
                    rej();
                var reader = new FileReader;
                reader.onload = (e) => {
                    return res(reader.result, reader);
                };
                reader.readAsDataURL(file);
            });
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    }
    exports.loadFileAsDataURL = loadFileAsDataURL;
    function eventloop(load, loop) {
        var cb = () => {
            load();
            var ticks = 0;
            var startTime = performance.now();
            setTimeout(function tmp() {
                if (loop(ticks, performance.now() - startTime))
                    return;
                ticks++;
                requestAnimationFrame(tmp);
            }, 0);
        };
        if (doc_loaded_listener_1.DOC_LOADED)
            setTimeout(cb, 0);
        else
            window.addEventListener("load", () => cb());
    }
    exports.eventloop = eventloop;
});
define("lib/common/util", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dateFormat(date) {
        var y = date.getFullYear();
        var m = padLeft((date.getMonth() + 1).toString(), 2, " ");
        var d = padLeft(date.getDate().toString(), 2, " ");
        var h = padLeft(date.getHours().toString(), 2, " ");
        var min = padLeft(date.getMinutes().toString(), 2, " ");
        var s = padLeft(date.getSeconds().toString(), 2, " ");
        return y + "/" + m + "/" + d + " " + h + ":" + min + ":" + s;
    }
    exports.dateFormat = dateFormat;
    function timeFormat(date) {
        var h = padLeft(date.getHours().toString(), 2, " ");
        var min = padLeft(date.getMinutes().toString(), 2, " ");
        var s = padLeft(date.getSeconds().toString(), 2, " ");
        return h + ":" + min + ":" + s;
    }
    exports.timeFormat = timeFormat;
    function mapValue(value, min1, max1, min2, max2) {
        return (value - min1) / (max1 - min1) * (max2 - min2) + min2;
    }
    exports.mapValue = mapValue;
    function showError(message) {
        console.error(message);
        if (typeof (alert) == "function")
            alert(message);
        throw message;
    }
    exports.showError = showError;
    function strRight(str, len) {
        return str.substr(str.length - len);
    }
    exports.strRight = strRight;
    function padLeft(str, len, pad) {
        return pad.charAt(0).repeat(len - str.length) + str;
    }
    exports.padLeft = padLeft;
});
define("lib/browser/webgl", ["require", "exports", "lib/common/util"], function (require, exports, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function initWebGL(canvas) {
        var gl = null;
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        }
        catch (e) { }
        if (!gl) {
            gl = null;
        }
        return gl;
    }
    exports.initWebGL = initWebGL;
    function getFragShader(gl, text) {
        var shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            util_1.showError(`シェーダーのコンパイルでエラー [Message|${gl.getShaderInfoLog(shader)}]`);
            return null;
        }
        return shader;
    }
    function getVertexShader(gl, text) {
        var shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            util_1.showError(`シェーダーのコンパイルでエラー [Message|${gl.getShaderInfoLog(shader)}]`);
            return null;
        }
        return shader;
    }
    function initShaders(gl, fragShaderText, vertexShaderText) {
        var vertexS = getVertexShader(gl, vertexShaderText);
        var fragS = getFragShader(gl, fragShaderText);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexS);
        gl.attachShader(shaderProgram, fragS);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
            util_1.showError(`シェーダープログラムを初期化できません [Message|${gl.getProgramInfoLog(shaderProgram)}]`);
        gl.useProgram(shaderProgram);
        return { fragS, vertexS, shaderProgram };
    }
    exports.initShaders = initShaders;
    function createArrayBuffer(gl, data) {
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }
    exports.createArrayBuffer = createArrayBuffer;
    function createIBO(gl, data) {
        var ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }
    exports.createIBO = createIBO;
    function createTexture(gl, source, fn) {
        var img = new Image();
        img.onload = () => {
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            fn(tex);
        };
        img.src = source;
    }
    exports.createTexture = createTexture;
});
define("webgl/responsiveWebgl", ["require", "exports", "lib/browser/webgl", "lib/common/util"], function (require, exports, webgl_1, util_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ResponsiveWebGL {
        constructor(parent, canvas, fragS, vertexS, clearColor = { R: 0.0, G: 0.0, B: 0.0, A: 1.0 }) {
            this.parent = parent;
            this.canvas = canvas;
            if (!canvas.getContext)
                throw "Canvasが対応していないようです";
            var gl = webgl_1.initWebGL(canvas);
            if (gl == null) {
                util_2.showError("WebGLは使えません。フォールバックもありません。死んでます。ほかのブラウザーをお試しください。");
                return;
            }
            this.gl = gl;
            gl.clearColor(clearColor.R, clearColor.G, clearColor.B, clearColor.A);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            var shaders = webgl_1.initShaders(gl, fragS, vertexS);
            if (shaders.fragS == null || shaders.vertexS == null || shaders.shaderProgram == null)
                throw "Shaderの初期化に失敗";
            this.shaders = { frag: shaders.fragS, vertex: shaders.vertexS, shaderProgram: shaders.shaderProgram };
            {
                this.scaleX = 1;
                this.scaleY = 1;
                var This = this;
                ((Fn) => {
                    var i = undefined;
                    window.addEventListener('resize', () => {
                        if (i !== undefined)
                            clearTimeout(i);
                        i = setTimeout(Fn, 100);
                    });
                })(() => this.onResize.call(This));
                this.onResize();
            }
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
    exports.ResponsiveWebGL = ResponsiveWebGL;
});
define("lib/browser/dom", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ge(id) { return document.getElementById(id); }
    exports.ge = ge;
    function setClassList(e, remove = [], add = []) {
        for (var i = 0; i < remove.length; i++)
            e.classList.remove(remove[i]);
        for (var i = 0; i < add.length; i++)
            e.classList.add(add[i]);
    }
    exports.setClassList = setClassList;
    function setClass2Elms(className, remove = [], add = []) {
        for (let i = 0; i < remove.length; i++)
            remove[i].classList.remove(className);
        for (let i = 0; i < add.length; i++)
            add[i].classList.add(className);
    }
    exports.setClass2Elms = setClass2Elms;
});
define("lib/browser/logger", ["require", "exports", "lib/common/util"], function (require, exports, util_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getLogger(logElm, maxLen, log2console = true) {
        return (...objects) => {
            if (log2console)
                console.log(objects.length == 1 ? objects[0] : objects);
            var output = logElm.innerText.split("\n");
            var prefix = `${util_3.timeFormat(new Date())}`;
            var blanks = " ".repeat(prefix.length);
            for (let i = 0; i < objects.length; i++) {
                const obj = objects[i];
                var appendText = "";
                if (typeof obj == "string")
                    appendText = obj;
                else if (typeof obj == "object") {
                    for (const key in obj)
                        if (obj.hasOwnProperty(key))
                            appendText += `[${key}|${JSON.stringify(obj[key])}]`;
                }
                else
                    appendText = JSON.stringify(obj);
                output.unshift(`${i == 0 ? prefix : blanks} ${appendText}`);
            }
            output = output.slice(0, maxLen);
            logElm.innerText = output.join("\n");
        };
    }
    exports.getLogger = getLogger;
});
define("index", ["require", "exports", "lib/browser/fps", "lib/browser/util", "webgl/responsiveWebgl", "lib/browser/dom", "lib/browser/logger", "lib/browser/webgl", "lib/common/util", "lib/browser/doc-loaded-listener"], function (require, exports, fps_1, util_4, responsiveWebgl_1, dom_1, logger_1, webgl_2, util_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FPSMeter = new fps_1.FPS([(fps) => exports.log({ FPS: fps })], 60);
    var fragS = `
void main(void) {
	gl_FragColor = vec4(0.8,gl_FragCoord.xy/vec2(500.0,500.0),1.0); //vec4(1.0, 1.0, 0.0, 1.0);
}`.split("\n").slice(1).join("\n");
    var vertexS = `
attribute vec3 position;

void main(void){
	gl_Position = vec4(position, 1.0);
}`.split("\n").slice(1).join("\n");
    var VBO;
    function init() {
        exports.log = logger_1.getLogger(dom_1.ge("log"), 30, false);
        exports.canvas = new responsiveWebgl_1.ResponsiveWebGL(dom_1.ge("c1-parent"), dom_1.ge("c1"), fragS, vertexS);
        const gl = exports.canvas.gl;
        var vbo = webgl_2.createArrayBuffer(gl, new Float32Array([
            0.5, 0.5, 0.0,
            -0.5, 0.5, 0.0,
            0.5, -0.5, 0.0,
            -0.5, -0.5, 0.0
        ]));
        if (vbo == null) {
            util_5.showError("死んだ");
            return;
        }
        VBO = vbo;
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            var attPosLoc = gl.getAttribLocation(exports.canvas.shaders.shaderProgram, 'position');
            gl.enableVertexAttribArray(attPosLoc);
            gl.vertexAttribPointer(attPosLoc, 3, gl.FLOAT, false, 0, 0);
        }
    }
    function onTick(ticks, time) {
        FPSMeter.tick();
        const gl = exports.canvas.gl;
        gl.clear(exports.canvas.gl.COLOR_BUFFER_BIT | exports.canvas.gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return false;
    }
    function main() { util_4.eventloop(init, onTick); }
    exports.main = main;
});
