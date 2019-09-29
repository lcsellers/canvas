import { Vector, vec, Rect, rect } from '../primitives'
import { Color, rgb } from '../color'
import { Draw2D } from './Draw2D'

export class PixelBuffer {

	private buf: ImageData

	constructor(private draw: Draw2D, public size: Vector) {
		this.buf = draw.ctx.createImageData(size.x, size.y)
	}

	get(coord: Vector): Color {
		const offset = this.offset(coord)
		return rgb(this.buf.data[offset], this.buf.data[offset + 1], this.buf.data[offset + 2], this.buf.data[offset + 3] / 255)
	}

	set(coord: Vector, color: Color) {
		const offset = this.offset(coord)
		this.buf.data[offset] = color.r
		this.buf.data[offset + 1] = color.g
		this.buf.data[offset + 2] = color.b
		this.buf.data[offset + 3] = color.a * 255
	}

	fill(r: Rect, color: Color) {
		for(let y = r.y; y < r.y + r.h; y++) {
			for(let x = r.x; x < r.x + r.w; x++) {
				this.set(vec(x, y), color)
			}
		}
	}

	render(pos: Vector = vec(0, 0), scale: Vector = vec(1, 1)) {
		this.draw.imageData(this.buf, pos, this.size, scale)
	}

	private offset(coord: Vector) {
		return coord.y * this.size.x * 4 + coord.x * 4
	}

}