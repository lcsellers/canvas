import { Vec } from './Vec'

export class Rect {

	x: number
	y: number
	w: number
	h: number

	constructor(x?: number | Rect | Vec, y?: number, w?: number, h?: number) {
		if(x instanceof Rect) {
			this.x = x.x
			this.y = x.y
			this.w = x.w
			this.h = x.h
		} else if(x instanceof Vec) {
			this.x = 0
			this.y = 0
			this.w = x.x
			this.h = x.y
		} else {
			this.x = x || 0
			this.y = y || 0
			this.w = w || 1
			this.h = h || 1
		}
	}

	get origin() {
		return new Vec(this.x, this.y)
	}
	set origin(v: Vec) {
		this.x = v.x
		this.y = v.y
	}

	get size() {
		return new Vec(this.w, this.h)
	}
	set size(v: Vec) {
		this.w = v.x
		this.h = v.y
	}

	includes(point: Vec) {
		return	point.x >= this.x &&
				point.x <= this.x + this.w &&
				point.y >= this.y &&
				point.y <= this.y + this.h	
	}

}