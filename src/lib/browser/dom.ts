export function ge(id: string) { return document.getElementById(id)!; }
export function setClassList(e: HTMLElement, remove: string[] = [], add: string[] = []) {
	for (var i = 0; i < remove.length; i++)e.classList.remove(remove[i]);
	for (var i = 0; i < add.length; i++)e.classList.add(add[i]);
}
export function setClass2Elms(className: string, remove: HTMLElement[] = [], add: HTMLElement[] = []) {
	for (let i = 0; i < remove.length; i++)remove[i].classList.remove(className);
	for (let i = 0; i < add.length; i++)add[i].classList.add(className);
}