import { Matrix as Mat, Vector as Vec } from "../lib/common/matrix-vector";
import { DEBUG_MODE } from "../common-setting";
import { showError } from "../lib/common/util";
interface Render { // canvasRender
	draw(ctx: CanvasRenderingContext2D): void
}
export enum RDM { // Reduce Dimensions Methods
	parallel, perspective, slice
}
export class Tetrahedron {
	readonly dimension: number;
	points: [Vec, Vec, Vec, Vec];
	constructor(d: number, points: [Vec, Vec, Vec, Vec]) {
		this.dimension = d;
		if (DEBUG_MODE)
			for (let i = 0; i < points.length; i++)
				if (points[i].dimension !== this.dimension) showError("Dimensionが合わない");
		this.points = points;
	}
	transform(m: Mat): this {
		if (this.dimension !== m.dimension) {
			showError("Dimensionが合わない");
			return this;
		}
		for (let i = 0; i < this.points.length; i++)
			this.points[i].mulMat(m);
		return this;
	}
	mapPoints(fn: (v: Vec) => void): this {
		for (let i = 0; i < this.points.length; i++)fn(this.points[i]);
		return this;
	}
	/** 次元を表すベクトルの、後ろの要素から削られていく。　(例: nD Vec --[Slice]--> 3D Vec(X,Y,Depth(描画順))) */
	ProjectionOn2Ds(methods: RDM[]): [Vec, Vec, Vec][] {
		if (this.dimension - methods.length != 2 || methods.filter(_ => _ == RDM.slice).length <= 1) {
			showError("死んでる。");
			return;
		}
		var shapes: { is2DPlain: boolean, _: Vec[] }[]
			= [{ is2DPlain: false, _: this.points.map(_ => _.clone()) }]; // TODO: Performance issue?
		for (let i = 0; i < methods.length; i++) {
			switch (methods[i]) {
				case RDM.perspective:
					for (let j = 0; j < shapes.length; j++) {
						for (let k = 0; k < shapes[j]._.length; k++) {
							const vec = shapes[j]._[k];
							vec.mulMat
						}
					}
				// fall through
				case RDM.parallel:

					break;
				case RDM.slice:

					break;
				default: showError("死んでる");
					break;
			}
		}
	}
}