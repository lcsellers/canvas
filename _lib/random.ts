export function randFloat(min: number, max: number) {
	return min + (Math.random() * (max - min))
}

export function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min
}

export function randElement<T>(arr: T[]): T {
	return arr[randInt(0, arr.length)]
}

export function randBool() {
	return Math.random() > 0.5
}