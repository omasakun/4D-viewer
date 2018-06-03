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
define("lib/browser/logger", ["require", "exports", "lib/common/util"], function (require, exports, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getLogger(logElm, maxLen, log2console = true) {
        return (...objects) => {
            if (log2console)
                console.log(objects.length == 1 ? objects[0] : objects);
            var output = logElm.innerText.split("\n");
            var prefix = `${util_1.timeFormat(new Date())}`;
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
define("lib/browser/webgl", ["require", "exports", "lib/common/util"], function (require, exports, util_2) {
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
            util_2.showError(`シェーダーのコンパイルでエラー [Message|${gl.getShaderInfoLog(shader)}]`);
            return null;
        }
        return shader;
    }
    function getVertexShader(gl, text) {
        var shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            util_2.showError(`シェーダーのコンパイルでエラー [Message|${gl.getShaderInfoLog(shader)}]`);
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
            util_2.showError(`シェーダープログラムを初期化できません [Message|${gl.getProgramInfoLog(shaderProgram)}]`);
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
define("common-setting", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEBUG_MODE = true;
});
define("matrix-vector", ["require", "exports", "common-setting", "lib/common/util"], function (require, exports, common_setting_1, util_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Matrix {
        constructor(d, array) {
            this.dimension = d;
            if (array == undefined) {
                array = new Array(d * d);
                for (let i = 0; i < d * d; i++) {
                    array[i] = 0;
                }
            }
            this.data = array;
            if (common_setting_1.DEBUG_MODE) {
                if (array.length != d * d) {
                    util_3.showError("Matrix.ts 指定されたarrayの長さが合わない。");
                    return;
                }
            }
        }
        addScala(n) {
            for (let i = 0; i < this.dimension * this.dimension; i++)
                this.data[i] += n;
            return this;
        }
        mulScala(n) {
            for (let i = 0; i < this.dimension * this.dimension; i++)
                this.data[i] *= n;
            return this;
        }
        addMat(m) {
            if (m.dimension != this.dimension) {
                util_3.showError("型が違って計算できない");
                throw "型が違って計算できない";
            }
            for (let i = 0; i < this.dimension * this.dimension; i++)
                this.data[i] += m.data[i];
            return this;
        }
        mulMatEach(m) {
            if (m.dimension != this.dimension) {
                util_3.showError("型が違って計算できない");
                throw "型が違って計算できない";
            }
            for (let i = 0; i < this.dimension * this.dimension; i++)
                this.data[i] *= m.data[i];
            return this;
        }
        mulMat(m) {
            if (m.dimension != this.dimension) {
                util_3.showError("型が違って計算できない");
                throw "型が違って計算できない";
            }
            var tmp2 = new Array(this.dimension * this.dimension);
            for (let x = 0; x < this.dimension; x++) {
                for (let y = 0; y < this.dimension; y++) {
                    var tmp = 0;
                    for (let i = 0; i < this.dimension; i++) {
                        tmp += this.data[x * this.dimension + i] * m.data[i * this.dimension + y];
                    }
                    tmp2[x * this.dimension + y] = tmp;
                }
            }
            this.data = tmp2;
            return this;
        }
        item(x, y) {
            if (0 > x || x >= this.dimension || 0 > y || y >= this.dimension) {
                util_3.showError("あうと おぶ ばうんず");
                throw "あうと おぶ ばうんず";
            }
            return this.data[x * this.dimension + y];
        }
        id() {
            for (let i = 0; i < this.dimension * this.dimension; i++)
                this.data[i] = i % (this.dimension + 1) == 0 ? 1 : 0;
            return this;
        }
        clone() {
            var _data = new Array(this.dimension * this.dimension);
            for (let i = 0; i < this.dimension * this.dimension; i++)
                _data[i] = this.data[i];
            return new Matrix(this.dimension, _data);
        }
        transpose() {
            var tmp = new Array(this.dimension * this.dimension);
            for (let i = 0; i < this.dimension * this.dimension; i++)
                tmp[i] = this.data[(i % this.dimension) * this.dimension + ((i / this.dimension) << 0)];
            this.data = tmp;
            return this;
        }
        inverse() {
            if (this.dimension == 1)
                return this;
            if (this.dimension == 2) {
                var det = this.data[0] * this.data[3] - this.data[1] * this.data[2];
                this.data = [this.data[3] / det, -this.data[1] / det, -this.data[2] / det, this.data[0] / det];
                return this;
            }
            var a = this.data, inv_a = new Array(this.dimension), n = this.dimension, tmp;
            for (var i = 0; i < n; i++) {
                inv_a[i] = new Array(n);
                for (var j = 0; j < n; j++)
                    inv_a[i][j] = (i == j) ? 1 : 0;
            }
            for (i = 0; i < n; i++) {
                tmp = 1 / a[i * (n + 1)];
                for (j = 0; j < n; j++) {
                    a[i * n + j] *= tmp;
                    inv_a[i][j] *= tmp;
                }
                for (j = 0; j < n; j++) {
                    if (i != j) {
                        tmp = a[j * n + i];
                        for (var k = 0; k < n; k++) {
                            a[j * n + k] -= a[i * n + k] * tmp;
                            inv_a[j][k] -= inv_a[i][k] * tmp;
                        }
                    }
                }
            }
            for (i = 0; i < n; i++) {
                for (j = 0; j < n; j++) {
                    this.data[i * n + j] = inv_a[i][j];
                }
            }
            return this;
        }
    }
    exports.Matrix = Matrix;
    class Vector {
        constructor(d, array) {
            this.dimension = d;
            if (array == undefined) {
                array = new Array(d);
                for (let i = 0; i < d; i++)
                    array[i] = 0;
            }
            this.data = array;
            if (array.length != d) {
                util_3.showError("Matrix.ts 指定されたarrayの長さが合わない。");
                return;
            }
        }
        addScala(n) {
            for (let i = 0; i < this.dimension; i++)
                this.data[i] += n;
            return this;
        }
        mulScala(n) {
            for (let i = 0; i < this.dimension; i++)
                this.data[i] *= n;
            return this;
        }
        addVec(v) {
            if (v.dimension != this.dimension) {
                util_3.showError("型が違って計算できない");
                throw "型が違って計算できない";
            }
            for (let i = 0; i < this.dimension; i++)
                this.data[i] += v[i];
            return this;
        }
        mulVec(v) {
            if (v.dimension != this.dimension) {
                util_3.showError("型が違って計算できない");
                throw "型が違って計算できない";
            }
            for (let i = 0; i < this.dimension; i++)
                this.data[i] *= v[i];
            return this;
        }
        distance() {
            var a = 0;
            for (var i = 0; i < this.dimension; i++)
                a += this.data[i] * this.data[i];
            return Math.sqrt(a);
        }
        ;
        item(i) {
            if (0 > i || i >= this.dimension) {
                util_3.showError("あうと おぶ ばうんず");
                throw "あうと おぶ ばうんず";
            }
            return this.data[i];
        }
        clone() {
            var _data = new Array(this.dimension);
            for (let i = 0; i < this.dimension; i++)
                _data[i] = this.data[i];
            return new Vector(this.dimension, _data);
        }
    }
    exports.Vector = Vector;
});
define("index", ["require", "exports", "lib/browser/fps", "lib/browser/util", "lib/browser/dom", "lib/browser/logger", "lib/browser/webgl", "lib/common/util", "matrix-vector", "lib/browser/doc-loaded-listener"], function (require, exports, fps_1, util_4, dom_1, logger_1, webgl_1, util_5, matrix_vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mat = matrix_vector_1.Matrix, exports.vec = matrix_vector_1.Vector;
    var programInfo, bufferInfo, tex;
    var FPSMeter = new fps_1.FPS([(fps) => exports.log({ FPS: fps })], 60);
    const arrays = {
        position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
        texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
        indices: [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
    };
    const uniforms = {
        u_diffuse: {}
    };
    function init() {
        exports.log = logger_1.getLogger(dom_1.ge("log"), 30, false);
        exports.canvasParent = dom_1.ge("c1-parent");
        exports.canvas = dom_1.ge("c1");
        if (!exports.canvas.getContext)
            throw "Canvasが対応していないようです";
        {
            let _gl = webgl_1.initWebGL(exports.canvas);
            if (_gl == null) {
                util_5.showError("WebGLは使えません。フォールバックもありません。死んでます。ほかのブラウザーをお試しください。");
                return;
            }
            exports.gl = _gl;
        }
        programInfo = twgl.createProgramInfo(exports.gl, ["vs", "fs"]);
        bufferInfo = twgl.createBufferInfoFromArrays(exports.gl, arrays);
        tex = twgl.createTexture(exports.gl, {
            min: exports.gl.NEAREST,
            mag: exports.gl.NEAREST,
            src: [
                128, 64, 64, 255,
                64, 128, 64, 255,
                64, 64, 128, 255,
                128, 128, 128, 255
            ],
        });
        uniforms.u_diffuse = tex;
    }
    function onTick(ticks, time) {
        time *= 0.001;
        twgl.resizeCanvasToDisplaySize(exports.gl.canvas);
        exports.gl.viewport(0, 0, exports.gl.canvas.width, exports.gl.canvas.height);
        exports.gl.enable(exports.gl.DEPTH_TEST);
        exports.gl.enable(exports.gl.CULL_FACE);
        exports.gl.clear(exports.gl.COLOR_BUFFER_BIT | exports.gl.DEPTH_BUFFER_BIT);
        const fov = 30 * Math.PI / 180;
        const aspect = exports.gl.canvas.clientWidth / exports.gl.canvas.clientHeight;
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
        exports.gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(exports.gl, programInfo, bufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        exports.gl.drawElements(exports.gl.TRIANGLES, bufferInfo.numElements, exports.gl.UNSIGNED_SHORT, 0);
        FPSMeter.tick();
        return false;
    }
    function main() { util_4.eventloop(init, onTick); }
    exports.main = main;
});
