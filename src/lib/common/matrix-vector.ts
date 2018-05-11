import { DEBUG_MODE } from './../../common-setting';
import { showError } from './util';
// Caution: 計算後、計算前のオブジェクトは破壊される場合があります。
export class Matrix {
	data: number[][];
	readonly dimension: number;
	constructor(d: number, array?: number[][]) {
		this.dimension = d;
		if (array == undefined) {
			array = [];
			for (let i = 0; i < d; i++) {
				array.push([]);
				for (let j = 0; j < d; j++)
					array[array.length - 1].push(0);
			}
		}
		this.data = array;
		if (DEBUG_MODE) {
			if (array.length != d) {
				showError("Matrix.ts 指定されたarrayの長さが合わない。");
				return;
			}
			for (let i = 0; i < d; i++) {
				if (array[i].length != d) {
					showError("Matrix.ts 指定されたarrayの長さが合わない。");
					return;
				}
			}
		}
	}
	addScala(n: number) {
		for (let i = 0; i < this.dimension; i++) for (let j = 0; j < this.dimension; j++)
			this.data[i][j] += n;
		return this;
	}
	mulScala(n: number) {
		for (let i = 0; i < this.dimension; i++) for (let j = 0; j < this.dimension; j++)
			this.data[i][j] *= n;
		return this;
	}
	addMat(m: Matrix) {
		if (m.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension; i++) for (let j = 0; j < this.dimension; j++)
			this.data[i][j] += m[i][j];
		return this;
	}
	mulMatEach(m: Matrix) {
		if (m.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension; i++) for (let j = 0; j < this.dimension; j++)
			this.data[i][j] *= m[i][j];
		return this;
	}
	id() {
		for (let i = 0; i < this.dimension; i++) for (let j = 0; j < this.dimension; j++)
			this.data[i][j] = i == j ? 1 : 0;
		return this;
	}
	clone() {
		var _data: number[][] = [];
		for (let i = 0; i < this.dimension; i++) {
			_data.push([]);
			for (let j = 0; j < this.dimension; j++)_data[_data.length - 1].push(this.data[i][j]);
		}
		return new Matrix(this.dimension, _data);
	}
}
export class Vector {
	data: number[];
	readonly dimension: number;
	constructor(d: number, array?: number[]) {
		this.dimension = d;
		if (array == undefined) {
			array = [];
			for (let i = 0; i < d; i++)
				array.push(0);
		}
		this.data = array;
		if (array.length != d) {
			showError("Matrix.ts 指定されたarrayの長さが合わない。");
			return;
		}
	}
	addScala(n: number) {
		for (let i = 0; i < this.dimension; i++)
			this.data[i] += n;
		return this;
	}
	mulScala(n: number) {
		for (let i = 0; i < this.dimension; i++)
			this.data[i] *= n;
		return this;
	}
	addVec(v: Vector) {
		if (v.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension; i++)
			this.data[i] += v[i];
		return this;
	}
	mulVec(v: Vector) {
		if (v.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		for (let i = 0; i < this.dimension; i++)
			this.data[i] *= v[i];
		return this;
	}
	mulMat(m: Matrix) {
		if (m.dimension != this.dimension) {
			showError("型が違って計算できない");
			throw "型が違って計算できない";
		}
		var sum;
		var _data: number[];
		for (var i = 0; i < this.dimension; i++) {
			sum = 0;
			for (var j = 0; j < this.dimension; j++)
				sum += this.data[j] * m.data[i][j];
			_data.push(sum);
		}
		this.data = _data;
		return this;
	}
	distance() {
		var a = 0;
		for (var i = 0; i < this.dimension; i++)
			a += this.data[i] * this.data[i];
		return Math.sqrt(a);
	};
	clone() {
		var _data: number[] = [];
		for (let i = 0; i < this.dimension; i++)_data.push(this.data[i]);
		return new Vector(this.dimension, _data);
	}
	reduceDimension(newD: number) {
		if (newD > this.dimension) {
			showError("変");
			return;
		}
		return new Vector(newD,this.data.slice(newD));
	}
}