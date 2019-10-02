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

export const colors = {
	transparent:	() => ({ r: 0,   g: 0,   b: 0,   a: 0 }) as Color,
	black:			() => ({ r: 0,   g: 0,   b: 0,   a: 1 }) as Color,
	white:			() => ({ r: 255, g: 255, b: 255, a: 1 }) as Color,
	red:			() => ({ r: 255, g: 0,   b: 0,   a: 1 }) as Color,
	orange:			() => ({ r: 255, g: 165, b: 0,   a: 1 }) as Color,
	yellow:			() => ({ r: 255, g: 255, b: 0,   a: 1 }) as Color,
	green:			() => ({ r: 0,   g: 255, b: 0,   a: 1 }) as Color,
	blue:			() => ({ r: 0,   g: 0,   b: 255, a: 1 }) as Color,
	indigo:			() => ({ r: 75,  g: 0,   b: 130, a: 1 }) as Color,
	violet:			() => ({ r: 238, g: 130, b: 238, a: 1 }) as Color
}