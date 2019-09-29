export function randRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min))
}

export function randElement<T>(arr: T[]): T {
	return arr[randRange(0, arr.length)]
}

export function randBool() {
	return Math.random() > 0.5
}