export var queue: { key: number, isDown: boolean, timeMS: number, e: KeyboardEvent }[]=[];
var pressed: Set<number> = new Set();
var inited = false;
export function init() {
	if (inited) {
		console.warn("keyboard.ts [Keyboard] is already initialized.")
		return;
	}
	inited = true;
	document.body.addEventListener("keydown", (e) => {
		if (this.pressed.has(e.keyCode)) return;
		this.pressed.add(e.keyCode);
		this.queue.push({
			key: e.keyCode,
			isDown: true,
			e: e,
			timeMS: performance.now()
		});
	});
	document.body.addEventListener("keyup", (e) => {
		this.pressed.delete(e.keyCode);
		this.queue.push({
			key: e.keyCode,
			isDown: false,
			e: e,
			timeMS: performance.now()
		});
	});
	window.addEventListener("blur", () => {
		this.pressed.clear();
	});
}	
export function isPressed(keyCode: number) {
	return this.pressed.has(keyCode);
}
export function pressedKeys() {
	return Array.from(this.pressed.keys());
}
export function nowMS() {
	return performance.now();
}