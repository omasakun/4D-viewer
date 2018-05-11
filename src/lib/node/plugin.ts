export type Verifier = (object: any) => boolean
export function makeFnVerifier(fn: string[]): Verifier {
	return (obj) => {
		for (let i = 0; i < fn.length; i++)if (typeof obj[fn[i]] !== "function") return false;
		return true;
	}
}
export function makePropVerifier(fn: [string, string][]): Verifier {
	return (obj) => {
		for (let i = 0; i < fn.length; i++)if (typeof obj[fn[i][0]] !== fn[i][1]) return false;
		return true;
	}
}
export function makeNoopVerifier(): Verifier {
	return (obj) => true;
}
export class Plugin {
	private object: any = undefined
	readonly verifier: Verifier
	readonly path: string
	constructor(path: string, verifier: Verifier = makeNoopVerifier(), shouldLoadImmediately = false) {
		this.verifier = verifier;
		this.path = path;
		if (shouldLoadImmediately) {
			this.get();
		}
	}
	tryLoad(): boolean {
		if (this.object === undefined) {
			this.object = require(this.path);
			return this.verifier(this.object);
		}
		return true;
	}
	get(): any {
		if (!this.tryLoad())
			throw "Invalid Plugin" // TODO: Does it really need to throw error?	
		return this.object;
	}
}