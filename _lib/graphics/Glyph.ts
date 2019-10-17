import { Vec } from 'lib/primitives'
import { Draw2D } from './Draw2D'
import { Text } from './Text'
import { colors } from './color'

export interface Glyph {
	data: Uint8ClampedArray
	size: Number
}

export class GlyphSet {

	private canvas: HTMLCanvasElement
	private draw: Draw2D
	private glyphs: Uint8ClampedArray[] = []
	private t: Text
	private center: Vec

	constructor(private size: number, font: string = 'monospace') {
		this.canvas = document.createElement('canvas')
		this.draw = new Draw2D(this.canvas, new Vec(size, size), 'none')
		this.center = new Vec(size/2, size/2)
		this.t = new Text('')
			.font(font)
			.size(size)
			.color(colors.white(), colors.black())
			.origin('center center')
	}

	add(from: number, to: number) {
		const len = this.size * this.size
		for(let c = from; c < to; c++) {
			this.draw.clear()
			this.draw.text(this.center, this.t.set(String.fromCharCode(c)))
			const { data } = this.draw.ctx.getImageData(0, 0, this.size, this.size)
			const glyph = new Uint8ClampedArray(len)
			for(let i = 0; i < len; i++) {
				glyph[i] = data[i * 4]
			}
			this.glyphs.push(glyph)
		}
		return this
	}

	get(index: number): Glyph {
		return {
			data: this.glyphs[index],
			size: this.size
		}
	}

	get length() {
		return this.glyphs.length
	}

}