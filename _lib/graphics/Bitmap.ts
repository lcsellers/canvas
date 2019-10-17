import { Vec, Rect, Spline, Polygon } from 'lib/primitives'
import { Color, rgb } from './color'
import { GraphicsObject } from './GraphicsObject'
import { Glyph } from './Glyph'

export class Bitmap extends GraphicsObject {

	wrap = false
	size: Vec
	data: ImageData

	private bounds: Rect

	constructor(size: Vec)
	constructor(img: HTMLImageElement)
	constructor(a: Vec | HTMLImageElement) {
		super()
		if(a instanceof Vec) {
			this.size = new Vec(a)
			this.data = this._d.ctx.createImageData(this.size.x, this.size.y)
		} else {
			this.size = new Vec(a.width, a.height)
			const ctx = this._d.getTempContext(this.size)
			ctx.drawImage(a, 0, 0, a.width, a.height)
			this.data = ctx.getImageData(0, 0, a.width, a.height)
		}
		this.bounds = new Rect(this.size)
	}

	get(coord: Vec): Color {
		const offset = this.offset(coord)
		return rgb(this.data.data[offset], this.data.data[offset + 1], this.data.data[offset + 2], this.data.data[offset + 3] / 255)
	}

	set(coord: Vec, color: Color) {
		if(this.wrap) {
			coord = this.bounds.wrap(coord)
		} else if(!this.bounds.includes(coord)) {
			return
		}
		const offset = this.offset(coord)
		this.data.data[offset] = color.r
		this.data.data[offset + 1] = color.g
		this.data.data[offset + 2] = color.b
		this.data.data[offset + 3] = color.a * 255
	}

	fill(r: Rect, color: Color) {
		for(let y = r.y; y < r.y + r.h; y++) {
			for(let x = r.x; x < r.x + r.w; x++) {
				this.set(new Vec(x, y), color)
			}
		}
	}

	clear(color: Color = { r: 0, g: 0, b: 0, a: 1 }) {
		this.fill(this.bounds, color)
	}

	drawLine(p1: Vec, p2: Vec, color: Color) {
		const delta = new Vec(p2.x - p1.x, p2.y - p1.y)
		const dabs = new Vec(Math.abs(delta.x), Math.abs(delta.y))
		const p = new Vec(2 * dabs.y - dabs.x, 2 * dabs.x - dabs.y)
		if(dabs.y <= dabs.x) {
			let coord, err
			if(delta.x >= 0) {
				coord = new Vec(p1)
				err = p2.x
			} else {
				coord = new Vec(p2)
				err = p1.x
			}

			this.set(coord, color)
			while(coord.x < err) {
				coord.x++
				if(p.x < 0) {
					p.x += 2 * dabs.y
				} else {
					coord.y += ((delta.x < 0 && delta.y < 0) || (delta.x > 0 && delta.y > 0))
						? 1
						: -1
					p.x += 2 * (dabs.y - dabs.x)
				}
				this.set(coord, color)
			}
		} else {
			let coord, err
			if(delta.y >= 0) {
				coord = new Vec(p1)
				err = p2.y
			} else {
				coord = new Vec(p2)
				err = p1.y
			}

			this.set(coord, color)
			while(coord.y < err) {
				coord.y++
				if(p.y <= 0) {
					p.y += 2 * dabs.x
				} else {
					coord.x += ((delta.x < 0 && delta.y < 0) || (delta.x > 0 && delta.y > 0))
						? 1
						: -1
					p.y += 2 * (dabs.x - dabs.y)
				}
				this.set(coord, color)
			}
		}
	}

	drawSpline(s: Spline, color: Color, precision = 0.005) {
		const end = s.loop ? s.points.length : s.points.length - 3
		for(let t = 0; t < end; t += precision) {
			const coord = s.getCoord(t)
			this.set(coord, color)
		}
	}

	drawPolygon(p: Polygon, pos: Vec, color: Color) {
		const vertices = p.getTransformedVertices(pos)
		for(let i = 0; i < vertices.length; i++) {
			this.drawLine(vertices[i], vertices[i === vertices.length - 1 ? 0 : i + 1], color)
		}
	}

	copyPixels(img: Bitmap, pos: Vec) {
		for(let y = 0; y < img.size.y; y++) {
			for(let x = 0; x < img.size.x; x++) {
				const i = new Vec(x, y)
				const color = img.get(i)
				if(!color.a) continue
				const p = Vec.add(pos, i)
				// const current = this.get(p)
				this.set(p, color)
			}
		}
	}

	drawGlyph(g: Glyph, pos: Vec, color: Color) {
		const a = Object.assign({}, color)
		for(let y = 0, i = 0; y < g.size; y++) {
			for(let x = 0; x < g.size; x++, i++) {
				const alpha = g.data[i] * color.a
				if(!alpha) continue
				a.a = alpha / 255
				const p = Vec.add(pos, new Vec(x, y))
				const b = this.get(p)
				if(b.a <= 0 || alpha === 255) {
					// draw the pixel directly
					this.set(p, a)
				} else {
					// composite the pixel
					const rev = 1 - a.a
					const over = a.a + b.a * rev
					const comp = rgb(
						((a.r/255 + (b.r/255)*rev) / over) * 255,
						((a.g/255 + (b.g/255)*rev) / over) * 255,
						((a.b/255 + (b.b/255)*rev) / over) * 255,
						over)
					this.set(p, comp)
				}
			}
		}
	}

	private offset(coord: Vec) {
		return Math.floor(coord.y) * this.size.x * 4 + Math.floor(coord.x) * 4
	}

}