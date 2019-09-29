export class Vec {

	x: number
	y: number

	constructor(x?: number | Vec, y?: number) {
		if(x instanceof Vec) {
			this.x = x.x
			this.y = x.y
		} else {
			this.x = x || 0
			this.y = y || 0
		}
	}

	add(v: Vec) {
		this.x += v.x
		this.y += v.y
		return this
	}

	sub(v: Vec) {
		this.x -= v.x
		this.y -= v.y
		return this
	}

	mult(v: Vec) {
		this.x *= v.x
		this.y *= v.y
		return this
	}

	div(v: Vec) {
		this.x /= v.x
		this.y /= v.y
		return this
	}

	scale(factor: number) {
		this.x *= factor
		this.y *= factor
		return this
	}

	eq(v: Vec) {
		return v.x === this.x && v.y === this.y
	}

	static add(v1: Vec, v2: Vec) {
		return new Vec(v1).add(v2)
	}

	static sub(v1: Vec, v2: Vec) {
		return new Vec(v1).sub(v2)
	}

	static mult(v1: Vec, v2: Vec) {
		return new Vec(v1).mult(v2)
	}

	static div(v1: Vec, v2: Vec) {
		return new Vec(v1).div(v2)
	}

	static scale(v: Vec, factor: number) {
		return new Vec(v).scale(factor)
	}

}