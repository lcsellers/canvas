export interface Margins {
	t: number
	r: number
	b: number
	l: number
}

export function parseMarginString(spec: string | number): Margins {
	if(typeof spec === 'number') {
		return { t: spec, r: spec, b: spec, l: spec }
	}
	const m = { t: 0, r: 0, b: 0, l: 0 }
	if(/^-?\d+( -?\d+){0,3}$/.test(spec)) {
		const parsed = spec.split(' ').map(str => parseInt(str, 10))
		m.t = parsed[0]
		m.r = parsed.length > 1 ? parsed[1] : parsed[0]
		m.b = parsed.length > 2 ? parsed[2] : parsed[0]
		m.l = parsed.length > 3
			? parsed[3]
			: parsed.length > 1
				? parsed[1]
				: parsed[0]
	}
	return m
}