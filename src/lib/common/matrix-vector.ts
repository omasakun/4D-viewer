import { DEBUG_MODE } from '../../common-setting';
import { showError } from 'common/util';
// Caution: 計算後、計算前のオブジェクトは破壊される場合があります。
/** dataの格納順は、
 * [[ 0  4  8 12]
 *  [ 1  5  9 13]
 *  [ 2  6 10 14]
 *  [ 3  7 11 15]]
 * のような順。やっぱりWebGLは癖が強い
 * get** は、今の行列の状態を完全に無視した挙動をする。
 */
export class Matrix {
	data: number[];
	readonly dimension: number;
	constructor(d: number, array?: number[]) {
		this.dimension = d;
		if (array == undefined) {
			array = new Array(d * d);
			for (let i = 0; i < d * d; i++) {
				array[i] = 0;
			}
		}
		this.data = array;
		if (DEBUG_MODE) {
			if (array.length != d * d) {
				showError("Matrix.ts 指定されたarrayの長さが合わない。");
				return;
			}
		}
	}
	addScala(n: number): this {
		for (let i = 0; i < this.dimension * this.dimension; i++)
			this.data[i] += n;
		return this;
	}
	mulScala(n: number): this {
		for (let i = 0; i < this.dimension * this.dimension; i++)
			this.data[i] *= n;
		return this;
	}
	addMat(m: Matrix): this {
		if (m.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension * this.dimension; i++)
			this.data[i] += m.data[i];
		return this;
	}
	mulMatEach(m: Matrix): this {
		if (m.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension * this.dimension; i++)
			this.data[i] *= m.data[i];
		return this;
	}
	mulMat(m: Matrix): this {
		if (m.dimension != this.dimension) {
			showError("型が違って計算できない");
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
	item(x: number, y: number): number {
		if (0 > x || x >= this.dimension || 0 > y || y >= this.dimension) {
			showError("あうと おぶ ばうんず");
			throw "あうと おぶ ばうんず";
		}
		return this.data[x * this.dimension + y];
	}
	getId(): this {
		for (let i = 0; i < this.dimension * this.dimension; i++)
			this.data[i] = i % (this.dimension + 1) == 0 ? 1 : 0;
		//this.data[i] = (i % this.dimension) == ((i / this.dimension) << 0) ? 1 : 0;
		return this;
	}
	clone(): Matrix {
		var _data: number[] = new Array(this.dimension * this.dimension);
		for (let i = 0; i < this.dimension * this.dimension; i++)
			_data[i] = this.data[i];
		return new Matrix(this.dimension, _data);
	}
	transpose(): this {
		var tmp: number[] = new Array(this.dimension * this.dimension);
		for (let i = 0; i < this.dimension * this.dimension; i++)
			tmp[i] = this.data[(i % this.dimension) * this.dimension + ((i / this.dimension) << 0)];
		this.data = tmp;
		return this;
	}
	inverse(): this { // なぜこのアルゴリズムで求まるのか、またこの計算が正しいかどうか理解してませんが、それが何か？
		if (this.dimension == 1) return this;
		if (this.dimension == 2) {
			var det = this.data[0] * this.data[3] - this.data[1] * this.data[2];
			this.data = [this.data[3] / det, -this.data[1] / det, -this.data[2] / det, this.data[0] / det];
			return this;
		}
		// TODO: 高速化
		// ここから http://thira.plavox.info/blog/2008/06/_c.html よりお借りしたソースコード(一部改変させていただきました)。Takekatsu Hiramura氏に感謝します。
		// Copyright © Takekatsu Hiramura. Licensed under the CC-BY-4.0.
		var a = this.data, inv_a: number[][] = new Array(this.dimension), n = this.dimension, tmp: number;
		for (var i = 0; i < n; i++) {
			inv_a[i] = new Array(n);
			for (var j = 0; j < n; j++) inv_a[i][j] = (i == j) ? 1 : 0;
		}
		//掃き出し法
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
		//逆行列を出力
		for (i = 0; i < n; i++) {
			for (j = 0; j < n; j++) {
				this.data[i * n + j] = inv_a[i][j];
			}
		}
		// ここまで http://thira.plavox.info/blog/2008/06/_c.html
		return this;
	}
	/* for nD CG */
	getRot(axis1: number, axis2: number, angle: number): this {
		if (0 > axis1 || axis1 >= this.dimension || 0 > axis2 || axis2 >= this.dimension) {
			showError("あうと おぶ ばうんず");
			throw "あうと おぶ ばうんず";
		}
		this.getId();
		//this.data[x * this.dimension + y];
		this.data[axis1 * this.dimension + axis1] = Math.cos(angle);
		this.data[axis1 * this.dimension + axis2] = -Math.sin(angle);
		this.data[axis2 * this.dimension + axis1] = Math.sin(angle);
		this.data[axis2 * this.dimension + axis2] = Math.cos(angle);
		return this;
	}
	scale(v: Vector): this {
		if (v.dimension != this.dimension) {
			showError("次元が違うエラー");
			throw "次元が違うエラー";
		}
		for (let i = 0; i < this.dimension; i++)
			for (let j = 0; j < this.dimension - 1; j++)
				this.data[j * this.dimension + i] *= v.data[i];
		return this;
	}
	transform(v: Vector): this {
		if (v.dimension != this.dimension) {
			showError("次元が違うエラー");
			throw "次元が違うエラー";
		}
		for (let i = 0; i < this.dimension; i++)
			this.data[(this.dimension - 1) * this.dimension + i] += v.data[i];
		return this;
	}
	/** oneAxis行には1が入っていることが前提の前提です
	 * tonD=2のときは、x,yの値がdevNumAxis番目の要素で割られることが期待される。
	 */
	getPerspective(tonD: number, fovFirstAxis: number, aspects: number[], near: number, far: number, oneAxis: number, devNumAxis: number): this {
		var f = Math.tan(Math.PI * 0.5 - 0.5 * fovFirstAxis);
		if (tonD != aspects.length + 1 || tonD >= this.dimension) {
			showError("次元が違うエラー");
			throw "次元が違うエラー";
		}
		this.getId();
		//this.data[x * this.dimension + y];
		for (let y = 0; y < tonD; y++) {
			this.data[y * this.dimension + y] = y == 0 ? fovFirstAxis : fovFirstAxis / aspects[y - 1];
		}
		// tonD番目の要素を計算するための式
		this.data[tonD * this.dimension + tonD] = 2 / (far - near);
		this.data[oneAxis * this.dimension + tonD] = far / (near - far);
		// devNumAxis番目の要素を計算するための式
		this.data[tonD * this.dimension + devNumAxis] = 1;
		this.data[devNumAxis * this.dimension + devNumAxis] = 0;
		return this;
	}
	slice(x1: number, x2: number, y1: number, y2: number) {
		if (x1 > x2 || y1 > y2 || x1 < 0 || y1 < 0 || x2 >= this.dimension || y2 >= this.dimension) {
			showError("あうと おぶ ばうんず");
			throw "あうと おぶ ばうんず";
		}
		var result: number[] = [];
		for (let y = y1; y <= y2; y++) {
			for (let x = x1; x <= x2; x++) {
				result.push(this.data[x * this.dimension + y]);
			}
		}
		return result;
	}
	/** for temporal use */
	mapping(d: number, map: string): Matrix {
		if (d * d != map.length) {
			showError("次元が違うエラー");
			throw "次元が違うエラー";
		}
		var keys = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var result = map.split("").map(v => this.data[keys.indexOf(v)]);
		return new Matrix(d, result);
	}
}
/** 縦に長い行列 */
export class Vector {
	data: number[];
	readonly dimension: number;
	constructor(d: number, array?: number[]) {
		this.dimension = d;
		if (array == undefined) {
			array = new Array(d);
			for (let i = 0; i < d; i++)
				array[i] = 0;
		}
		this.data = array;
		if (array.length != d) {
			showError("Matrix.ts 指定されたarrayの長さが合わない。");
			return;
		}
	}
	addScala(n: number): this {
		for (let i = 0; i < this.dimension; i++)
			this.data[i] += n;
		return this;
	}
	mulScala(n: number): this {
		for (let i = 0; i < this.dimension; i++)
			this.data[i] *= n;
		return this;
	}
	addVec(v: Vector): this {
		if (v.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension; i++)
			this.data[i] += v[i];
		return this;
	}
	mulVec(v: Vector): this {
		if (v.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension; i++)
			this.data[i] *= v[i];
		return this;
	}
	distance(): number {
		var a = 0;
		for (var i = 0; i < this.dimension; i++)
			a += this.data[i] * this.data[i];
		return Math.sqrt(a);
	};
	item(i: number): number {
		if (0 > i || i >= this.dimension) {
			showError("あうと おぶ ばうんず");
			throw "あうと おぶ ばうんず";
		}
		return this.data[i];
	}
	clone(): Vector {
		var _data: number[] = new Array(this.dimension);
		for (let i = 0; i < this.dimension; i++)_data[i] = this.data[i];
		return new Vector(this.dimension, _data);
	}
}