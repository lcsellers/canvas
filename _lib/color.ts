export interface Color {
	r: number
	g: number
	b: number
	a: number
}

export function rgb(r: number, g: number, b: number, a: number = 1): Color {
	return { r, g, b, a }
}

export function hsl(h: number, s: number, l: number, a: number = 1): Color {
	while(h < 0) {
		h = 360 - h
	}
	h = h % 360

	const C = (1 - Math.abs(2*l - 1)) * s
	const X = C * (1 - Math.abs(((h / 60) % 2) - 1))
	const m = l - C/2

	let rp, gp, bp
	if(h < 60) {
		[rp, gp, bp] = [C, X, 0]
	} else if(h < 120) {
		[rp, gp, bp] = [X, C, 0]
	} else if(h < 180) {
		[rp, gp, bp] = [0, C, X]
	} else if(h < 240) {
		[rp, gp, bp] = [0, X, C]
	} else if(h < 300) {
		[rp, gp, bp] = [X, 0, C]
	} else {
		[rp, gp, bp] = [C, 0, X]
	}

	return {
		r: (rp + m) * 255,
		g: (gp + m) * 255,
		b: (bp + m) * 255,
		a
	}
}

export function gray(shade: number, a: number = 1): Color {
	return { r: shade, g: shade, b: shade, a }
}

export function colorString(color: Color) {
	return color.a === 1
		? `rgb(${color.r},${color.g},${color.b})`
		: `rgba(${color.r},${color.g},${color.b},${color.a})`
}