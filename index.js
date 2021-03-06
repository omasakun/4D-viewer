define("src/lib/browser/doc-loaded-listener", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DOC_LOADED = false || exports.DOC_LOADED == true;
    window.addEventListener("load", () => exports.DOC_LOADED = true);
});
define("src/lib/browser/fps", ["require", "exports"], function (require, exports) {
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
define("src/lib/browser/util", ["require", "exports", "src/lib/browser/doc-loaded-listener"], function (require, exports, doc_loaded_listener_1) {
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
define("src/lib/browser/dom", ["require", "exports"], function (require, exports) {
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
define("src/lib/common/util", ["require", "exports"], function (require, exports) {
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
define("src/lib/browser/logger", ["require", "exports", "src/lib/common/util"], function (require, exports, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getLogger(logElm, maxLen, log2console = true) {
        var output = [];
        return (...objects) => {
            if (log2console)
                console.log(objects.length == 1 ? objects[0] : objects);
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
define("src/lib/browser/webgl", ["require", "exports", "src/lib/common/util"], function (require, exports, util_2) {
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
define("src/common-setting", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEBUG_MODE = true;
});
define("src/lib/common/matrix-vector", ["require", "exports", "src/common-setting", "src/lib/common/util"], function (require, exports, common_setting_1, util_3) {
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
        getId() {
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
        getRot(axis1, axis2, angle) {
            if (0 > axis1 || axis1 >= this.dimension || 0 > axis2 || axis2 >= this.dimension) {
                util_3.showError("あうと おぶ ばうんず");
                throw "あうと おぶ ばうんず";
            }
            this.getId();
            this.data[axis1 * this.dimension + axis1] = Math.cos(angle);
            this.data[axis1 * this.dimension + axis2] = -Math.sin(angle);
            this.data[axis2 * this.dimension + axis1] = Math.sin(angle);
            this.data[axis2 * this.dimension + axis2] = Math.cos(angle);
            return this;
        }
        scale(v) {
            if (v.dimension != this.dimension) {
                util_3.showError("次元が違うエラー");
                throw "次元が違うエラー";
            }
            for (let i = 0; i < this.dimension; i++)
                for (let j = 0; j < this.dimension - 1; j++)
                    this.data[j * this.dimension + i] *= v.data[i];
            return this;
        }
        transform(v) {
            if (v.dimension != this.dimension) {
                util_3.showError("次元が違うエラー");
                throw "次元が違うエラー";
            }
            for (let i = 0; i < this.dimension; i++)
                this.data[(this.dimension - 1) * this.dimension + i] += v.data[i];
            return this;
        }
        getPerspective(tonD, fovFirstAxis, aspects, near, far, oneAxis, devNumAxis) {
            var f = Math.tan(Math.PI * 0.5 - 0.5 * fovFirstAxis);
            if (tonD != aspects.length + 1 || tonD >= this.dimension) {
                util_3.showError("次元が違うエラー");
                throw "次元が違うエラー";
            }
            this.getId();
            for (let y = 0; y < tonD; y++) {
                this.data[y * this.dimension + y] = y == 0 ? f : f / aspects[y - 1];
            }
            this.data[tonD * this.dimension + tonD] = 0;
            this.data[oneAxis * this.dimension + tonD] = 1;
            this.data[tonD * this.dimension + devNumAxis] = 1;
            this.data[devNumAxis * this.dimension + devNumAxis] = 0;
            return this;
        }
        slice(x1, x2, y1, y2) {
            if (x1 > x2 || y1 > y2 || x1 < 0 || y1 < 0 || x2 >= this.dimension || y2 >= this.dimension) {
                util_3.showError("あうと おぶ ばうんず");
                throw "あうと おぶ ばうんず";
            }
            var result = [];
            for (let y = y1; y <= y2; y++) {
                for (let x = x1; x <= x2; x++) {
                    result.push(this.data[x * this.dimension + y]);
                }
            }
            return result;
        }
        padding(m, x1, y1) {
            if (this.dimension < m.dimension - Math.max(x1, y1)) {
                util_3.showError("次元が違うエラー");
                throw "次元が違うエラー";
            }
            for (let x = x1; x < x1 + m.dimension; x++) {
                for (let y = x1; y < y1 + m.dimension; y++) {
                    this.data[x * this.dimension + y] = m.data[(x - x1) * m.dimension + (y - y1)];
                }
            }
            return this;
        }
        mapping(d, map) {
            if (d * d != map.length) {
                util_3.showError("次元が違うエラー");
                throw "次元が違うエラー";
            }
            var keys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var result = map.split("").map(v => this.data[keys.indexOf(v)]);
            return new Matrix(d, result);
        }
        toString() {
            var result = [""];
            for (let y = 0; y < this.dimension; y++) {
                var tmp = [];
                for (let x = 0; x < this.dimension; x++) {
                    var n = this.item(x, y);
                    tmp.push((n < 0 ? "-" : " ") + Math.abs(n).toFixed(4));
                }
                result.push(tmp.join(" | "));
            }
            return result.join("\n");
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
define("node_modules/@types/twgl.js/index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("src/DeviceOrientationControls", ["require", "exports", "src/lib/common/matrix-vector"], function (require, exports, matrix_vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
    exports.Vector3 = Vector3;
    class Euler {
        constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
            this.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];
            this.DefaultOrder = 'XYZ';
            this.onChangeCallback = () => void 0;
            this.x = x;
            this.y = y;
            this.z = z;
            this._order = order;
        }
        get order() { return this._order; }
        set order(value) {
            this._order = value;
            this.onChangeCallback();
        }
        set(x, y, z, order) {
            this.x = x;
            this.y = y;
            this.z = z;
            this._order = order || this._order;
            this.onChangeCallback();
            return this;
        }
        setFromQuaternion(q, order, update = true) {
            var clamp = (x, a, b) => (x < a) ? a : ((x > b) ? b : x);
            var sqx = q._x * q._x;
            var sqy = q._y * q._y;
            var sqz = q._z * q._z;
            var sqw = q._w * q._w;
            order = order || this._order;
            if (order === 'XYZ') {
                this.x = Math.atan2(2 * (q._x * q._w - q._y * q._z), (sqw - sqx - sqy + sqz));
                this.y = Math.asin(clamp(2 * (q._x * q._z + q._y * q._w), -1, 1));
                this.z = Math.atan2(2 * (q._z * q._w - q._x * q._y), (sqw + sqx - sqy - sqz));
            }
            else if (order === 'YXZ') {
                this.x = Math.asin(clamp(2 * (q._x * q._w - q._y * q._z), -1, 1));
                this.y = Math.atan2(2 * (q._x * q._z + q._y * q._w), (sqw - sqx - sqy + sqz));
                this.z = Math.atan2(2 * (q._x * q._y + q._z * q._w), (sqw - sqx + sqy - sqz));
            }
            else if (order === 'ZXY') {
                this.x = Math.asin(clamp(2 * (q._x * q._w + q._y * q._z), -1, 1));
                this.y = Math.atan2(2 * (q._y * q._w - q._z * q._x), (sqw - sqx - sqy + sqz));
                this.z = Math.atan2(2 * (q._z * q._w - q._x * q._y), (sqw - sqx + sqy - sqz));
            }
            else if (order === 'ZYX') {
                this.x = Math.atan2(2 * (q._x * q._w + q._z * q._y), (sqw - sqx - sqy + sqz));
                this.y = Math.asin(clamp(2 * (q._y * q._w - q._x * q._z), -1, 1));
                this.z = Math.atan2(2 * (q._x * q._y + q._z * q._w), (sqw + sqx - sqy - sqz));
            }
            else if (order === 'YZX') {
                this.x = Math.atan2(2 * (q._x * q._w - q._z * q._y), (sqw - sqx + sqy - sqz));
                this.y = Math.atan2(2 * (q._y * q._w - q._x * q._z), (sqw + sqx - sqy - sqz));
                this.z = Math.asin(clamp(2 * (q._x * q._y + q._z * q._w), -1, 1));
            }
            else if (order === 'XZY') {
                this.x = Math.atan2(2 * (q._x * q._w + q._y * q._z), (sqw - sqx + sqy - sqz));
                this.y = Math.atan2(2 * (q._x * q._z + q._y * q._w), (sqw + sqx - sqy - sqz));
                this.z = Math.asin(clamp(2 * (q._z * q._w - q._x * q._y), -1, 1));
            }
            else {
                console.warn('THREE.Euler: .setFromQuaternion() given unsupported order: ' + order);
            }
            this._order = order;
            if (update !== false)
                this.onChangeCallback();
            return this;
        }
        reorder(newOrder) {
            var q = new Quaternion();
            q.setFromEuler(this);
            this.setFromQuaternion(q, newOrder);
        }
        makeRotationMatrix() {
            var te = new Array(16);
            var x = this.x, y = this.y, z = this.z;
            var a = Math.cos(x), b = Math.sin(x);
            var c = Math.cos(y), d = Math.sin(y);
            var e = Math.cos(z), f = Math.sin(z);
            if (this.order === 'XYZ') {
                var ae = a * e, af = a * f, be = b * e, bf = b * f;
                te[0] = c * e;
                te[4] = -c * f;
                te[8] = d;
                te[1] = af + be * d;
                te[5] = ae - bf * d;
                te[9] = -b * c;
                te[2] = bf - ae * d;
                te[6] = be + af * d;
                te[10] = a * c;
            }
            else if (this.order === 'YXZ') {
                var ce = c * e, cf = c * f, de = d * e, df = d * f;
                te[0] = ce + df * b;
                te[4] = de * b - cf;
                te[8] = a * d;
                te[1] = a * f;
                te[5] = a * e;
                te[9] = -b;
                te[2] = cf * b - de;
                te[6] = df + ce * b;
                te[10] = a * c;
            }
            else if (this.order === 'ZXY') {
                var ce = c * e, cf = c * f, de = d * e, df = d * f;
                te[0] = ce - df * b;
                te[4] = -a * f;
                te[8] = de + cf * b;
                te[1] = cf + de * b;
                te[5] = a * e;
                te[9] = df - ce * b;
                te[2] = -a * d;
                te[6] = b;
                te[10] = a * c;
            }
            else if (this.order === 'ZYX') {
                var ae = a * e, af = a * f, be = b * e, bf = b * f;
                te[0] = c * e;
                te[4] = be * d - af;
                te[8] = ae * d + bf;
                te[1] = c * f;
                te[5] = bf * d + ae;
                te[9] = af * d - be;
                te[2] = -d;
                te[6] = b * c;
                te[10] = a * c;
            }
            else if (this.order === 'YZX') {
                var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
                te[0] = c * e;
                te[4] = bd - ac * f;
                te[8] = bc * f + ad;
                te[1] = f;
                te[5] = a * e;
                te[9] = -b * e;
                te[2] = -d * e;
                te[6] = ad * f + bc;
                te[10] = ac - bd * f;
            }
            else if (this.order === 'XZY') {
                var ac = a * c, ad = a * d, bc = b * c, bd = b * d;
                te[0] = c * e;
                te[4] = -f;
                te[8] = d * e;
                te[1] = ac * f + bd;
                te[5] = a * e;
                te[9] = ad * f - bc;
                te[2] = bc * f - ad;
                te[6] = b * e;
                te[10] = bd * f + ac;
            }
            te[3] = 0;
            te[7] = 0;
            te[11] = 0;
            te[12] = 0;
            te[13] = 0;
            te[14] = 0;
            te[15] = 1;
            return new matrix_vector_1.Matrix(4, te);
        }
    }
    exports.Euler = Euler;
    class Quaternion {
        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.onChangeCallback = () => void 0;
            this._x = x;
            this._y = y;
            this._z = z;
            this._w = w;
        }
        ;
        setFromEuler(euler, update = false) {
            var c1 = Math.cos(euler.x / 2);
            var c2 = Math.cos(euler.y / 2);
            var c3 = Math.cos(euler.z / 2);
            var s1 = Math.sin(euler.x / 2);
            var s2 = Math.sin(euler.y / 2);
            var s3 = Math.sin(euler.z / 2);
            if (euler.order === 'XYZ') {
                this._x = s1 * c2 * c3 + c1 * s2 * s3;
                this._y = c1 * s2 * c3 - s1 * c2 * s3;
                this._z = c1 * c2 * s3 + s1 * s2 * c3;
                this._w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (euler.order === 'YXZ') {
                this._x = s1 * c2 * c3 + c1 * s2 * s3;
                this._y = c1 * s2 * c3 - s1 * c2 * s3;
                this._z = c1 * c2 * s3 - s1 * s2 * c3;
                this._w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            else if (euler.order === 'ZXY') {
                this._x = s1 * c2 * c3 - c1 * s2 * s3;
                this._y = c1 * s2 * c3 + s1 * c2 * s3;
                this._z = c1 * c2 * s3 + s1 * s2 * c3;
                this._w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (euler.order === 'ZYX') {
                this._x = s1 * c2 * c3 - c1 * s2 * s3;
                this._y = c1 * s2 * c3 + s1 * c2 * s3;
                this._z = c1 * c2 * s3 - s1 * s2 * c3;
                this._w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            else if (euler.order === 'YZX') {
                this._x = s1 * c2 * c3 + c1 * s2 * s3;
                this._y = c1 * s2 * c3 + s1 * c2 * s3;
                this._z = c1 * c2 * s3 - s1 * s2 * c3;
                this._w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (euler.order === 'XZY') {
                this._x = s1 * c2 * c3 - c1 * s2 * s3;
                this._y = c1 * s2 * c3 - s1 * c2 * s3;
                this._z = c1 * c2 * s3 + s1 * s2 * c3;
                this._w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            if (update !== false)
                this.onChangeCallback();
            return this;
        }
        multiply(q, p) {
            if (p !== undefined) {
                console.warn('Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.');
                return this.multiplyQuaternions(q, p);
            }
            return this.multiplyQuaternions(this, q);
        }
        multiplyQuaternions(a, b) {
            var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
            var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
            this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
            this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
            this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
            this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
            this.onChangeCallback();
            return this;
        }
        setFromAxisAngle(axis, angle) {
            var halfAngle = angle / 2, s = Math.sin(halfAngle);
            this._x = axis.x * s;
            this._y = axis.y * s;
            this._z = axis.z * s;
            this._w = Math.cos(halfAngle);
            this.onChangeCallback();
            return this;
        }
        inverse() {
            this._x *= -1;
            this._y *= -1;
            this._z *= -1;
            return this;
        }
        makeRotationMatrix() {
            var q = this;
            var te = new Array(16);
            var x = q._x, y = q._y, z = q._z, w = q._w;
            var x2 = x + x, y2 = y + y, z2 = z + z;
            var xx = x * x2, xy = x * y2, xz = x * z2;
            var yy = y * y2, yz = y * z2, zz = z * z2;
            var wx = w * x2, wy = w * y2, wz = w * z2;
            te[0] = 1 - (yy + zz);
            te[4] = xy - wz;
            te[8] = xz + wy;
            te[1] = xy + wz;
            te[5] = 1 - (xx + zz);
            te[9] = yz - wx;
            te[2] = xz - wy;
            te[6] = yz + wx;
            te[10] = 1 - (xx + yy);
            te[3] = 0;
            te[7] = 0;
            te[11] = 0;
            te[12] = 0;
            te[13] = 0;
            te[14] = 0;
            te[15] = 1;
            return new matrix_vector_1.Matrix(4, te);
        }
    }
    exports.Quaternion = Quaternion;
    var degToRad = (() => {
        var degreeToRadiansFactor = Math.PI / 180;
        return deg => deg * degreeToRadiansFactor;
    })();
    function deviceOrientationControl(object) {
        object.rotation.reorder('YXZ');
        object.rotation.onChangeCallback = () => void object.quaternion.setFromEuler(object.rotation, false);
        object.quaternion.onChangeCallback = () => void object.rotation.setFromQuaternion(object.quaternion, object.rotation.order, false);
        var deviceOrientation = {};
        var screenOrientation = 0;
        var alphaOffset = 0;
        var setObjectQuaternion = (() => {
            var zee = new Vector3(0, 0, 1);
            var euler = new Euler();
            var q0 = new Quaternion();
            var q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
            return function (quaternion, alpha, beta, gamma, orient) {
                euler.set(beta, alpha, -gamma, 'YXZ');
                quaternion.setFromEuler(euler);
                quaternion.multiply(q1);
                quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
                return quaternion;
            };
        })();
        var onScreenOrientationChangeEvent;
        window.addEventListener('orientationchange', onScreenOrientationChangeEvent = () => screenOrientation = (() => {
            switch (window.screen.orientation || window.screen.mozOrientation) {
                case 'landscape-primary':
                    return 90;
                case 'landscape-secondary':
                    return -90;
                case 'portrait-secondary':
                    return 180;
                case 'portrait-primary':
                    return 0;
            }
            if (typeof window.orientation == "string")
                return 0;
            return window.orientation || 0;
        })(), false);
        onScreenOrientationChangeEvent();
        window.addEventListener('deviceorientation', e => deviceOrientation = e, false);
        return function update() {
            var device = deviceOrientation;
            if (device) {
                var alpha = device.alpha ? degToRad(device.alpha) + alphaOffset : 0;
                var beta = device.beta ? degToRad(device.beta) : 0;
                var gamma = device.gamma ? degToRad(device.gamma) : 0;
                var orient = screenOrientation ? degToRad(screenOrientation) : 0;
                setObjectQuaternion(object.quaternion, alpha, beta, gamma, orient);
            }
        };
    }
    exports.deviceOrientationControl = deviceOrientationControl;
    ;
});
define("src/index", ["require", "exports", "src/lib/browser/fps", "src/lib/browser/util", "src/lib/browser/dom", "src/lib/browser/logger", "src/lib/browser/webgl", "src/lib/common/util", "src/lib/common/matrix-vector", "node_modules/@types/twgl.js/index", "src/DeviceOrientationControls", "src/lib/browser/doc-loaded-listener"], function (require, exports, fps_1, util_4, dom_1, logger_1, webgl_1, util_5, matrix_vector_2, index_1, DeviceOrientationControls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    index_1.twgl = window["twgl"];
    exports.M = matrix_vector_2.Matrix, exports.V = matrix_vector_2.Vector;
    var programInfo, bufferInfo, cubeTex;
    var framebufferInfo_left;
    var FPSMeter = new fps_1.FPS([(fps) => exports.log({ FPS: fps })], 60);
    function nA(len) {
        return ".".repeat(len).split("");
    }
    function fullScreen() {
        ((elm) => [
            "requestFullscreen",
            "webkitRequestFullScreen",
            "mozRequestFullScreen",
            "msRequestFullscreen"
        ].some(_ => elm[_] ? (elm[_](), true) : false))(document.documentElement);
    }
    function exitFullScreen() {
        ((elm) => [
            "exitFullscreen",
            "webkitExitFullscreen",
            "mozCancelFullScreen",
            "msExitFullscreen"
        ].some(_ => elm[_] ? (elm[_](), true) : false))(document.documentElement);
    }
    const dim = 4;
    const arrays = {
        position: {
            numComponents: dim,
            data: [].concat(...nA(dim * dim).map((_, i) => nA(dim).map((_, j) => i & (1 << j) ? 1 : -1))),
            type: Float32Array
        },
        indices: {
            numComponents: 3,
            data: (() => {
                var result = [];
                for (let i = 0; i < dim * dim; i++)
                    for (let j = 0; j < dim; j++)
                        for (let k = j + 1; k < dim; k++)
                            if ((i & (1 << j)) == 0 && (i & (1 << k)) == 0 && i + (1 << k) + (1 << j) < (1 << dim)) {
                                result.push([i, i + (1 << j), i + (1 << k)]);
                                result.push([i + (1 << k) + (1 << j), i + (1 << k), i + (1 << j)]);
                            }
                return [].concat(...result);
            })(),
            type: Uint16Array
        },
        texcoord: {
            numComponents: 2,
            data: [].concat(...nA(dim * dim).map((_, i) => {
                var tmp = nA(dim).map((_, j) => i & (1 << j) ? 1 : 0);
                return [(tmp[0] + tmp[2]) & 1, (tmp[1] + tmp[2]) & 1];
            })),
            type: Float32Array
        }
    };
    const uniforms = {
        u_diffuse: {},
        u_L_worldViewBeforeA: [],
        u_L_worldViewBeforeB: [],
        u_L_worldViewAfterA: [],
        u_L_worldViewAfterB: [],
        u_L_clip: [],
        u_R_worldViewBeforeA: [],
        u_R_worldViewBeforeB: [],
        u_R_worldViewAfterA: [],
        u_R_worldViewAfterB: [],
        u_R_clip: [],
        u_eye: 0,
        u_zRange: [],
        u_wRange: [],
        u_xyTanInv: []
    };
    var options = {
        _: [["fov", "[ FOV ]", 1], ["eyeSep4D", "両眼視差", 20], ["eyeSep2D", "目の幅", 20], ["scale", "拡大率", 20]],
        fov: 60,
        eyeSep4D: 1,
        eyeSep2D: 1,
        scale: 2
    };
    var rotations = [
        ["No Rotation", t => new exports.M(5).getId()],
        ["XZ Rot.", t => new exports.M(5).getRot(0, 2, t)],
        ["XYZ Rot.", t => new exports.M(5).getRot(0, 1, t).mulMat(new exports.M(5).getRot(1, 2, t))],
        ["ZW Rot.", t => new exports.M(5).getRot(2, 3, t)],
        ["XZW Rot.", t => new exports.M(5).getRot(0, 2, t).mulMat(new exports.M(5).getRot(2, 3, t))],
        ["XYZW Rot.", t => new exports.M(5).getRot(0, 1, t).mulMat(new exports.M(5).getRot(1, 2, t).mulMat(new exports.M(5).getRot(2, 3, t)))]
    ];
    var rotationID = 0;
    const relativeSensor = true;
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
        programInfo = index_1.twgl.createProgramInfo(exports.gl, ["vs", "fs"]);
        bufferInfo = index_1.twgl.createBufferInfoFromArrays(exports.gl, arrays);
        cubeTex = index_1.twgl.createTexture(exports.gl, {
            min: exports.gl.NEAREST,
            mag: exports.gl.NEAREST,
            src: [
                128, 64, 64, 255,
                64, 128, 64, 255,
                64, 64, 128, 255,
                128, 128, 128, 255
            ],
        });
        uniforms.u_diffuse = cubeTex;
        addEvents();
        initSensor();
    }
    function addEvents() {
        var count = 1;
        exports.canvas.addEventListener("click", () => {
            count = (count + 1) % 3;
            dom_1.ge("control-info").classList.add("hide");
            if (count == 0) {
                dom_1.ge("control").classList.remove("hide");
                dom_1.ge("log").classList.add("hide");
            }
            else if (count == 1) {
                dom_1.ge("control").classList.remove("hide");
                dom_1.ge("log").classList.remove("hide");
            }
            else if (count == 2) {
                dom_1.ge("control").classList.add("hide");
                dom_1.ge("log").classList.add("hide");
                fullScreen();
            }
        });
        const cI = dom_1.ge("control-input"), cT = dom_1.ge("control-title"), cR = dom_1.ge("control-rotate");
        var currentOptionIndex = 0;
        var updateCT = () => {
            cT.innerText = options._[currentOptionIndex][1];
            cI.value = (options[options._[currentOptionIndex][0]] * options._[currentOptionIndex][2]).toString();
        };
        updateCT();
        cT.addEventListener("click", () => {
            currentOptionIndex = (currentOptionIndex + 1) % options._.length;
            updateCT();
        });
        cI.addEventListener("keyup", (e) => {
            if (e.code == "Enter") {
                options[options._[currentOptionIndex][0]] = Number.parseFloat(cI.value) / options._[currentOptionIndex][2];
                updateCT();
            }
        });
        cI.addEventListener("mouseup", (e) => {
            options[options._[currentOptionIndex][0]] = Number.parseFloat(cI.value) / options._[currentOptionIndex][2];
            updateCT();
        });
        setInterval(() => {
            options[options._[currentOptionIndex][0]] = Number.parseFloat(cI.value) / options._[currentOptionIndex][2];
            updateCT();
        }, 500);
        var updateCR = () => {
            cR.innerText = rotations[rotationID][0];
        };
        updateCR();
        cR.addEventListener("click", (e) => {
            rotationID = (rotationID + 1) % rotations.length;
            updateCR();
        });
    }
    var deviceRot = {
        rotation: new DeviceOrientationControls_1.Euler(),
        quaternion: new DeviceOrientationControls_1.Quaternion()
    }, deviceUpdate = () => 0;
    function initSensor() {
        deviceUpdate = DeviceOrientationControls_1.deviceOrientationControl(deviceRot);
    }
    function onTick(ticks, time) {
        deviceUpdate();
        time *= 0.001;
        index_1.twgl.resizeCanvasToDisplaySize(exports.gl.canvas, window.devicePixelRatio || 1.0);
        exports.gl.viewport(0, 0, exports.gl.canvas.width, exports.gl.canvas.height);
        exports.gl.enable(exports.gl.BLEND);
        exports.gl.blendFunc(exports.gl.ONE, exports.gl.ONE);
        exports.gl.clear(exports.gl.COLOR_BUFFER_BIT | exports.gl.DEPTH_BUFFER_BIT);
        const fov = options.fov * Math.PI / 180;
        let matTmp = new exports.M(5).getId()
            .mulMat(rotations[rotationID][1](time))
            .mulMat(new exports.M(5).padding(deviceRot.quaternion.inverse().makeRotationMatrix().scale(new exports.V(4, [-1, -1, 1, 1])), 0, 0))
            .transform(new exports.V(5, [0, 0, 3, 3, 0]));
        let matL = matTmp.clone().transform(new exports.V(5, [0 + options.eyeSep4D / 2, 0, 0, 0, 0]));
        let matR = matTmp.clone().transform(new exports.V(5, [0 - options.eyeSep4D / 2, 0, 0, 0, 0]));
        uniforms.u_L_worldViewBeforeA = matL.slice(0, 3, 0, 3);
        uniforms.u_L_worldViewBeforeB = matL.slice(4, 4, 0, 3);
        uniforms.u_R_worldViewBeforeA = matR.slice(0, 3, 0, 3);
        uniforms.u_R_worldViewBeforeB = matR.slice(4, 4, 0, 3);
        let matTmpAfter = new exports.M(5).getId().scale(new exports.V(5, [options.scale, options.scale, 1, 1, 1]));
        let matLAfter = matTmpAfter.clone().transform(new exports.V(5, [0 - options.eyeSep2D / 2, 0, 0, 0, 0]));
        let matRAfter = matTmpAfter.clone().transform(new exports.V(5, [0 + options.eyeSep2D / 2, 0, 0, 0, 0]));
        uniforms.u_L_worldViewAfterA = matLAfter.slice(0, 3, 0, 3);
        uniforms.u_L_worldViewAfterB = matLAfter.slice(4, 4, 0, 3);
        uniforms.u_R_worldViewAfterA = matRAfter.slice(0, 3, 0, 3);
        uniforms.u_R_worldViewAfterB = matRAfter.slice(4, 4, 0, 3);
        uniforms.u_L_clip = [-1.0, 0.0, -1.0, 1.0];
        uniforms.u_R_clip = [0.0, 1.0, -1.0, 1.0];
        uniforms.u_zRange = [0.1, 10];
        uniforms.u_wRange = [0.1, 10];
        const cW = exports.gl.canvas.clientWidth, cH = exports.gl.canvas.clientHeight, cMin = Math.min(cW, cH);
        const f = 1 / Math.tan(0.5 * fov);
        uniforms.u_xyTanInv = [f * cW / cMin, f * cH / cMin];
        exports.tmmmm = uniforms;
        exports.tmmmm.mat = matTmp.clone();
        exports.gl.useProgram(programInfo.program);
        index_1.twgl.setBuffersAndAttributes(exports.gl, programInfo, bufferInfo);
        uniforms.u_eye = -1;
        index_1.twgl.setUniforms(programInfo, uniforms);
        exports.gl.drawElements(exports.gl.TRIANGLES, bufferInfo.numElements, exports.gl.UNSIGNED_SHORT, 0);
        uniforms.u_eye = 1;
        index_1.twgl.setUniforms(programInfo, uniforms);
        exports.gl.drawElements(exports.gl.TRIANGLES, bufferInfo.numElements, exports.gl.UNSIGNED_SHORT, 0);
        FPSMeter.tick();
        return false;
    }
    function main() { util_4.eventloop(init, onTick); }
    exports.main = main;
});
