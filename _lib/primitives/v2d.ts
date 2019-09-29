interface Vector {
	x: number
	y: number
}

const vec = (x: number, y: number): Vector => ({ x, y })
vec.add = (v1: Vector, v2: Vector) => vec(v1.x + v2.x, v1.y + v2.y)
vec.sub = (v1: Vector, v2: Vector) => vec(v1.x - v2.x, v1.y - v2.y)
vec.mult = (v1: Vector, v2: Vector) => vec(v1.x * v2.x, v1.y * v2.y)
vec.scale = (v: Vector, scale: number) => vec(v.x * scale, v.y * scale)
vec.eq = (v1: Vector, v2: Vector) => v1.x === v2.x && v1.y === v2.y

export {
	Vector,
	vec
}
