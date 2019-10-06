import { Margins, parseMarginString } from '../margins'
import { Color, colors, colorString } from '../color'
import { Vec } from '../primitives'

type Alignment =	'top left'		| 'top center'		| 'top right' |
					'center left'	| 'center center'	| 'center right' |
					'bottom left'	| 'bottom center'	| 'bottom right'

export class Text {

	private _vAlign: 'top' | 'center' | 'bottom' = 'top'
	private _hAlign: 'left' | 'center' | 'right' = 'left'
	private _padding: Margins = { t: 0, r: 0, b: 0, l: 0 }

	constructor(
		private ctx: CanvasRenderingContext2D,
		public text = '',
		private _family = 'monospace',
		private _bold = 'normal',
		private _italic = 'normal',
		private _size = 16,
		private _fg = colors.black(),
		private _bg = colors.transparent()) {}
	
	set(val: string) {
		this.text = val
		return this
	}

	size(size: number) {
		this._size = size
		return this
	}

	font(family: string) {
		this._family = family
		return this
	}

	bold(weight: string | boolean = 'bold') {
		if(typeof weight === 'boolean') {
			weight = weight ? 'bold' : 'normal'
		}
		this._bold = weight
		return this
	}

	italic(style: string | boolean = 'italic') {
		if(typeof style === 'boolean') {
			style = style ? 'italic' : 'normal'
		}
		this._italic = style
		return this
	}

	origin(align: Alignment) {
		[this._vAlign, this._hAlign] = align.split(' ') as any
		return this
	}

	padding(spec: string | number) {
		this._padding = parseMarginString(spec)
		return this
	}

	color(fg: Color, bg?: Color) {
		this._fg = fg
		if(bg) this._bg = bg
		return this
	}

	background(bg: Color) {
		this._bg = bg
		return this
	}

	get renderedSize() {
		const textSize = this.textBoundsSize
		return Vec.add(
			textSize,
			new Vec(
				this._padding.l + this._padding.r,
				this._padding.t + this._padding.b
			)
		)
	}

	render(pos: Vec) {
		const paddingOffset = new Vec(this._padding.l, this._padding.t)
		// shift the given draw position by padding
		pos = Vec.add(pos, paddingOffset)

		// text bounding box width/height before padding
		// this getter sets up the ctx with the configured font styles
		const textSize = this.textBoundsSize

		// calculate final padded width and height
		const paddedSize = Vec.add(
			textSize,
			new Vec(
				this._padding.l + this._padding.r,
				this._padding.t + this._padding.b
			)
		)

		// shift the draw position depending on alignment
		if(this._vAlign === 'center') {
			pos.y -= paddedSize.y/2
		}
		else if(this._vAlign === 'bottom') {
			pos.y -= paddedSize.y
		}

		if(this._hAlign === 'center') {
			pos.x -= paddedSize.x/2
		} else if(this._hAlign === 'right') {
			pos.x -= paddedSize.x
		}

		// draw background
		if(this._bg.a > 0) {
			const bgPos = Vec.sub(pos, paddingOffset)
			this.ctx.fillStyle = colorString(this._bg)
			this.ctx.fillRect(bgPos.x, bgPos.y, paddedSize.x, paddedSize.y)
		}

		// draw text
		this.ctx.fillStyle = colorString(this._fg)
		this.ctx.fillText(this.text, pos.x, pos.y)

	}

	private get textBoundsSize() {
		this.ctx.font = this.fontStyle
		this.ctx.textAlign = 'left'
		this.ctx.textBaseline = 'top'
		const metrics = this.ctx.measureText(this.text)
		return new Vec(metrics.actualBoundingBoxRight, metrics.actualBoundingBoxDescent)
	}

	private get fontStyle() {
		return `${this._italic} ${this._bold} ${this._size}px/1 ${this._family}`
	}

}