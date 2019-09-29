import { Vector, vec, Rect, rect } from '../primitives'

export type ScaleType = 'stretch' | 'fit' | 'shrink' | 'responsive' | 'none'

interface Stroke {
	color: string
	width: number
}

export class Draw2D {

	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	size!: Vector
	scale: Vector = vec(1, 1)
	origin: Vector = vec(0, 0)

	private scaleType: ScaleType
	private pxCanvas: HTMLCanvasElement
	private pxCtx: CanvasRenderingContext2D

	constructor(canvas: HTMLCanvasElement, dim?: Vector, scale?: ScaleType) {

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
		this.rect(rect(0, 0, this.size.x, this.size.y), fillStyle)
		this.ctx.restore()
	}

	line(start: Vector, end: Vector, stroke: string) {
		this.applyScale()
		this.ctx.beginPath()
		this.ctx.strokeStyle = stroke
		this.ctx.moveTo(start.x, start.y)
		this.ctx.lineTo(end.x, end.y)
		this.ctx.stroke()
		this.ctx.restore()
	}

	rect(rectangle: Rect, fillStyle: string, stroke?: Stroke) {
		this.applyScale()
		if(stroke) {
			this.ctx.fillStyle = stroke.color
			this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h)
			rectangle = rect(
				rectangle.x + stroke.width,
				rectangle.y + stroke.width,
				rectangle.w - (stroke.width * 2),
				rectangle.h - (stroke.width * 2)
			)
		}
		this.ctx.fillStyle = fillStyle
		this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h)
		this.ctx.restore()
	}

	circle(center: Vector, radius: number, fillStyle: string) {
		this.applyScale()
		this.ctx.fillStyle = fillStyle
		this.ctx.beginPath()
		this.ctx.arc(center.x, center.y, radius, 0, Math.PI*2, true)
		this.ctx.fill()
		this.ctx.restore()
	}

	text(text: string, origin: Vector, fillStyle: string) {
		this.applyScale()
		this.ctx.fillStyle = fillStyle
		this.ctx.fillText(text, origin.x, origin.y)
		this.ctx.restore()
	}

	image(img: HTMLImageElement, origin: Vector) {
		this.applyScale()
		this.ctx.drawImage(img, origin.x, origin.y, img.width, img.height)
		this.ctx.restore()
	}

	imageData(img: ImageData, origin: Vector, size: Vector, scale: Vector) {
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
		const viewport = vec(window.innerWidth, window.innerHeight)

		// update physical and virtual size
		if(this.scaleType === 'none') {
			this.canvas.width = this.size.x
			this.canvas.height = this.size.y
		} else {
			this.canvas.width = viewport.x
			this.canvas.height = viewport.y
		}
		if(this.scaleType === 'responsive') {
			this.size = viewport
		}

		if(this.scaleType === 'stretch') {
			this.scale = vec(viewport.x / this.size.x, viewport.y / this.size.y)
			this.origin = vec(0, 0)
		} else if(this.scaleType === 'fit') {
			let scale = viewport.x / this.size.x
			if(this.size.y * scale > viewport.y) {
				scale = viewport.y / this.size.y
				this.origin = vec((viewport.x - (this.size.x * scale))/2, 0)
			} else {
				this.origin = vec(0, (viewport.y - (this.size.y * scale))/2)
			}
			this.scale = vec(scale, scale)
		} else if(this.scaleType === 'shrink') {
			let scale = 1
			if(this.size.x > viewport.x) {
				scale = viewport.x / this.size.x
				if(this.size.y * scale > viewport.y) {
					scale = viewport.y / this.size.y
					this.origin = vec((viewport.x - (this.size.x * scale))/2, 0)
				} else {
					this.origin = vec(0, (viewport.y - (this.size.y * scale))/2)
				}
			} else if(this.size.y > viewport.y) {
				scale = viewport.y / this.size.y
				if(this.size.x * scale > viewport.x) {
					scale = viewport.x / this.size.x
					this.origin = vec(0, (viewport.y - (this.size.y * scale))/2)
				} else {
					this.origin = vec((viewport.x - (this.size.x * scale))/2, 0)
				}
			} else {
				this.origin = vec(
					(viewport.x - this.size.x)/2,
					(viewport.y - this.size.y)/2
				)
			}
			this.scale = vec(scale, scale)
		}

	}

}