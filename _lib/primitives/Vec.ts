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

	scale(v: Vec) {
		this.x *= v.x
		this.y *= v.y
		return this
	}

	div(v: Vec) {
		this.x /= v.x
		this.y /= v.y
		return this
	}

	mult(factor: number) {
		this.x *= factor
		this.y *= factor
		return this
	}

	rot(angle: number) {
		const newX = this.x * Math.cos(angle) - this.y * Math.sin(angle)
		const newY = this.x * Math.sin(angle) + this.y * Math.cos(angle)
		this.x = newX
		this.y = newY
	}
	
	dist(v: Vec) {
		const a = Math.abs(this.x - v.x)
		const b = Math.abs(this.y - v.y)
		return Math.sqrt(a * a + b * b)
	}

	eq(v: Vec) {
		return v.x === this.x && v.y === this.y
	}

	copy(v: Vec) {
		this.x = v.x
		this.y = v.y
		return this
	}

	static fromAngle(angle: number) {
		return new Vec(Math.sin(angle), -Math.cos(angle))
	}

	static add(v1: Vec, v2: Vec) {
		return new Vec(v1).add(v2)
	}

	static sub(v1: Vec, v2: Vec) {
		return new Vec(v1).sub(v2)
	}

	static scale(v1: Vec, v2: Vec) {
		return new Vec(v1).scale(v2)
	}

	static div(v1: Vec, v2: Vec) {
		return new Vec(v1).div(v2)
	}

	static mult(v: Vec, factor: number) {
		return new Vec(v).mult(factor)
	}

	static rot(v: Vec, angle: number) {
		return new Vec(v).rot(angle)
	}

}