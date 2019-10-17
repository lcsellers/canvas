import { Vec } from 'lib/primitives'
import { GraphicsObject } from './GraphicsObject'
import { Margins, parseMarginString } from './margins'
import { Color, colors, colorString } from './color'

type Alignment =	'top left'		| 'top center'		| 'top right' |
					'center left'	| 'center center'	| 'center right' |
					'bottom left'	| 'bottom center'	| 'bottom right'

export class Text extends GraphicsObject {

	static D_FAMILY = 'monospace'
	static D_BOLD = 'normal'
	static D_ITALIC = 'normal'
	static D_SIZE = 16
	static D_FG = colors.black()
	static D_BG = colors.transparent()

	private _family: string
	private _bold: string
	private _italic: string
	private _size: number
	private _fg: Color
	private _bg: Color

	private _vAlign: 'top' | 'center' | 'bottom' = 'top'
	private _hAlign: 'left' | 'center' | 'right' = 'left'
	private _padding: Margins = { t: 0, r: 0, b: 0, l: 0 }

	constructor(public text = '') {
		super()
		this._family = Text.D_FAMILY
		this._bold = Text.D_BOLD
		this._italic = Text.D_ITALIC
		this._size = Text.D_SIZE
		this._fg = Text.D_FG
		this._bg = Text.D_BG
	}
	
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

	getTextBoundsSize(ctx: CanvasRenderingContext2D = this._d.ctx) {
		ctx.font = this.fontStyle
		ctx.textAlign = 'left'
		ctx.textBaseline = 'top'
		const metrics = ctx.measureText(this.text)
		return new Vec(metrics.actualBoundingBoxRight, metrics.actualBoundingBoxDescent)
	}

	get renderedSize() {
		const textSize = this.getTextBoundsSize()
		return Vec.add(
			textSize,
			new Vec(
				this._padding.l + this._padding.r,
				this._padding.t + this._padding.b
			)
		)
	}

	render(pos: Vec, ctx: CanvasRenderingContext2D = this._d.ctx) {
		const paddingOffset = new Vec(this._padding.l, this._padding.t)
		// shift the given draw position by padding
		pos = Vec.add(pos, paddingOffset)

		// text bounding box width/height before padding
		// this getter sets up the ctx with the configured font styles
		const textSize = this.getTextBoundsSize(ctx)

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
			ctx.fillStyle = colorString(this._bg)
			ctx.fillRect(bgPos.x, bgPos.y, paddedSize.x, paddedSize.y)
		}

		// draw text
		ctx.fillStyle = colorString(this._fg)
		ctx.fillText(this.text, pos.x, pos.y)

	}

	private get fontStyle() {
		return `${this._italic} ${this._bold} ${this._size}px/1 ${this._family}`
	}

}