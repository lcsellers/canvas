export function randFloat(min: number = 0, max: number = 1) {
	return min + (Math.random() * (max - min))
}

export function randInt(min: number, max: number) {
	return Math.floor(randFloat(min, max))
}

export function randElement<T>(arr: T[]): T {
	return arr[randInt(0, arr.length)]
}

export function randBool() {
	return Math.random() > 0.5
}