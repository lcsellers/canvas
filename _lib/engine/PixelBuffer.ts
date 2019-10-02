import { Vec, Rect } from '../primitives'
import { Color, rgb } from '../color'
import { Draw2D } from './Draw2D'

export class PixelBuffer {

	private buf: ImageData
	private bounds: Rect

	constructor(private draw: Draw2D, public size: Vec) {
		this.buf = draw.ctx.createImageData(size.x, size.y)
		this.bounds = new Rect(size)
	}

	get(coord: Vec): Color {
		const offset = this.offset(coord)
		return rgb(this.buf.data[offset], this.buf.data[offset + 1], this.buf.data[offset + 2], this.buf.data[offset + 3] / 255)
	}

	set(coord: Vec, color: Color) {
		const offset = this.offset(coord)
		this.buf.data[offset] = color.r
		this.buf.data[offset + 1] = color.g
		this.buf.data[offset + 2] = color.b
		this.buf.data[offset + 3] = color.a * 255
	}

	fill(r: Rect, color: Color) {
		for(let y = r.y; y < r.y + r.h; y++) {
			for(let x = r.x; x < r.x + r.w; x++) {
				this.set(new Vec(x, y), color)
			}
		}
	}

	clear(color: Color) {
		this.fill(this.bounds, color)
	}

	render(pos: Vec = new Vec(), scale: Vec = new Vec(1, 1)) {
		this.draw.imageData(this.buf, pos, this.size, scale)
	}

	private offset(coord: Vec) {
		return coord.y * this.size.x * 4 + coord.x * 4
	}

}