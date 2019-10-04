import { Vec, Rect } from '../primitives'
import { Text } from './Text'
import { Sprite } from './Sprite'

export type ScaleType = 'stretch' | 'fit' | 'shrink' | 'responsive' | 'none'

interface Stroke {
	color: string
	width: number
}

export class Draw2D {

	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	size!: Vec
	scale: Vec = new Vec(1, 1)
	origin: Vec = new Vec()

	private scaleType: ScaleType
	private pxCanvas: HTMLCanvasElement
	private pxCtx: CanvasRenderingContext2D
	private viewport!: Vec

	constructor(canvas: HTMLCanvasElement, dim?: Vec, scale?: ScaleType) {

		this.canvas = canvas
		const ctx = canvas.getContext('2d')
		if(!ctx) {
			throw new Error('Error getting 2D context')
		}
		this.ctx = ctx

		this.pxCanvas = document.createElement('canvas')
		let pxCtx = this.pxCanvas.getContext('2d')
		if(!pxCtx) {
			throw new Error('Error getting 2D context')
		}
		this.pxCtx = pxCtx

		this.scaleType = scale || 'none'
		
		if(!dim) {
			// no virtual size passed forces scale type to responsive
			this.scaleType = 'responsive'
		} else if(scale !== 'responsive') {
			// passed virt size is ignored if responsive specified
			this.size = dim
		}

		this.calculateScale()
		window.addEventListener('resize', () => this.calculateScale())
	}

	clear(fillStyle = 'black') {
		this.rect(new Rect(0, 0, this.size.x, this.size.y), fillStyle)
		this.ctx.restore()
	}

	letterbox(fillStyle = 'white') {
		this.ctx.fillStyle = fillStyle
		if(this.origin.x === 0) {
			// horizontal letterboxes
			this.ctx.fillRect(0, 0, this.viewport.x, this.origin.y)
			this.ctx.fillRect(0, this.viewport.y - this.origin.y, this.viewport.x, this.origin.y)
		} else {
			// vertical letterboxes
			this.ctx.fillRect(0, 0, this.origin.x, this.viewport.y)
			this.ctx.fillRect(this.viewport.x - this.origin.x, 0, this.origin.x, this.viewport.y)
		}
	}

	line(start: Vec, end: Vec, stroke: string) {
		this.applyScale()
		this.ctx.beginPath()
		this.ctx.strokeStyle = stroke
		this.ctx.moveTo(start.x, start.y)
		this.ctx.lineTo(end.x, end.y)
		this.ctx.stroke()
		this.ctx.restore()
	}

	rect(rect: Rect, fillStyle: string, stroke?: Stroke) {
		this.applyScale()
		if(stroke) {
			this.ctx.fillStyle = stroke.color
			this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
			rect = new Rect(
				rect.x + stroke.width,
				rect.y + stroke.width,
				rect.w - (stroke.width * 2),
				rect.h - (stroke.width * 2)
			)
		}
		this.ctx.fillStyle = fillStyle
		this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		this.ctx.restore()
	}

	circle(center: Vec, radius: number, fillStyle: string) {
		this.applyScale()
		this.ctx.fillStyle = fillStyle
		this.ctx.beginPath()
		this.ctx.arc(center.x, center.y, radius, 0, Math.PI*2, true)
		this.ctx.fill()
		this.ctx.restore()
	}

	text(origin: Vec, text: Text) {
		this.applyScale()
		text.render(origin)
		this.ctx.restore()
	}

	sprite(sprite: Sprite, origin: Vec, scale: number | Vec = new Vec(1, 1)) {
		if(typeof scale === 'number') {
			scale = new Vec(scale, scale)
		}
		this.applyScale()
		this.ctx.drawImage(sprite.img,
			sprite.region.x,sprite.region.y,sprite.region.w,sprite.region.h, // source
			origin.x,origin.y,sprite.region.w * scale.x,sprite.region.h * scale.y
		)
		this.ctx.restore()
	}

	image(img: HTMLImageElement, origin: Vec) {
		this.applyScale()
		this.ctx.drawImage(img, origin.x, origin.y, img.width, img.height)
		this.ctx.restore()
	}

	imageData(img: ImageData, origin: Vec, size: Vec, scale: Vec) {
		this.pxCanvas.width = size.x
		this.pxCanvas.height = size.y
		this.pxCtx.putImageData(img, 0, 0)
		this.ctx.imageSmoothingEnabled = false
		this.ctx.drawImage(this.pxCanvas,
			this.origin.x + origin.x * this.scale.x, this.origin.y + origin.y * this.scale.y,
			size.x * this.scale.x * scale.x, size.y * this.scale.y * scale.y)
	}

	private applyScale() {
		this.ctx.save()
		this.ctx.translate(this.origin.x, this.origin.y)
		this.ctx.scale(this.scale.x, this.scale.y)
	}

	private calculateScale() {
		this.viewport = new Vec(window.innerWidth, window.innerHeight)

		// update physical and virtual size
		if(this.scaleType === 'none') {
			this.canvas.width = this.size.x
			this.canvas.height = this.size.y
		} else {
			this.canvas.width = this.viewport.x
			this.canvas.height = this.viewport.y
		}
		if(this.scaleType === 'responsive') {
			this.size = this.viewport
		}

		if(this.scaleType === 'stretch') {
			this.scale = Vec.div(this.viewport, this.size)
			this.origin = new Vec()
		} else if(this.scaleType === 'fit') {
			let scale = this.viewport.x / this.size.x
			if(this.size.y * scale > this.viewport.y) {
				scale = this.viewport.y / this.size.y
				this.origin = new Vec((this.viewport.x - (this.size.x * scale))/2, 0)
			} else {
				this.origin = new Vec(0, (this.viewport.y - (this.size.y * scale))/2)
			}
			this.scale = new Vec(scale, scale)
		} else if(this.scaleType === 'shrink') {
			let scale = 1
			if(this.size.x > this.viewport.x) {
				scale = this.viewport.x / this.size.x
				if(this.size.y * scale > this.viewport.y) {
					scale = this.viewport.y / this.size.y
					this.origin = new Vec((this.viewport.x - (this.size.x * scale))/2, 0)
				} else {
					this.origin = new Vec(0, (this.viewport.y - (this.size.y * scale))/2)
				}
			} else if(this.size.y > this.viewport.y) {
				scale = this.viewport.y / this.size.y
				if(this.size.x * scale > this.viewport.x) {
					scale = this.viewport.x / this.size.x
					this.origin = new Vec(0, (this.viewport.y - (this.size.y * scale))/2)
				} else {
					this.origin = new Vec((this.viewport.x - (this.size.x * scale))/2, 0)
				}
			} else {
				this.origin = Vec.sub(this.viewport, this.size).scale(0.5)
			}
			this.scale = new Vec(scale, scale)
		}

	}

}