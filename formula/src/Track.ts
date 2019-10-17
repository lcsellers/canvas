import { Vec } from 'lib/primitives'
import { rgb, gray, colors, Bitmap } from 'lib/graphics'
import { DynamicObject } from 'lib/engine'

const ROAD = gray(100)
const LINE = colors.white()
const CLIP1 = colors.red()
const CLIP2 = colors.white()
const GRASS1 = rgb(76, 179, 55)
const GRASS2 = rgb(0, 225, 55)

interface Segment {
	length: number
	curve: number
}

export default class Track extends DynamicObject {

	length: number
	curve = 0
	curvature = 0
	private segments: Segment[]
	private screen: Vec

	constructor(segments: number[][]) {
		super()
		this.screen = new Vec(this._d.size)
		this.length = 0
		this.segments = segments.map(arr => {
			const seg = { length: arr[0], curve: arr[1] }
			this.length += seg.length
			return seg
		})
	}

	update(distance: number, speed: number) {
		let d = 0
		let i = 0
		while(d <= distance) {
			d += this.segments[i].length
			i++
		}

		this.curve += ((this.segments[i - 1].curve - this.curve) * speed) / this._f.frameTime / 2
		this.curvature += this.curve * speed / this._f.frameTime
	}

	draw(px: Bitmap, distance: number) {

		const halfHeight = this.screen.y/2
		const width = this.screen.x

		for(let y = 0; y < halfHeight; y++) {

			const perspective = y / halfHeight

			const roadMiddle = 0.5 + (0.5 * this.curve * Math.pow(1 - perspective, 3))
			let roadWidth = 0.1 + perspective * 0.8
			const clipWidth = roadWidth * 0.15
			const lineWidth = roadWidth * 0.01

			const grassColor = Math.sin(20 * Math.pow(1 - perspective, 2) + (distance * 0.04)) > 0 ? GRASS1 : GRASS2
			const clipColor = Math.sin(80 * Math.pow(1 - perspective, 2) + (distance * 0.4)) > 0 ? CLIP1 : CLIP2
			const lineColor = Math.sin(30 * Math.pow(1 - perspective, 2) + (distance * 0.2)) > 0 ? ROAD : LINE

			roadWidth *= 0.5

			const rightGrassStart = (roadMiddle + roadWidth + clipWidth) * width
			const rightClipStart = (roadMiddle + roadWidth) * width
			const lineEnd = (roadMiddle + lineWidth) * width
			const lineStart = (roadMiddle - lineWidth) * width
			const leftClipEnd = (roadMiddle - roadWidth) * width
			const leftGrassEnd = (roadMiddle - roadWidth - clipWidth) * width

			for(const coord = new Vec(0, y + halfHeight); coord.x < width; coord.x++) {
				if(coord.x > rightGrassStart)
					px.set(coord, grassColor)
				else if(coord.x > rightClipStart)
					px.set(coord, clipColor)
				else if(coord.x > lineEnd)
					px.set(coord, ROAD)
				else if(coord.x > lineStart)
					px.set(coord, lineColor)
				else if(coord.x > leftClipEnd)
					px.set(coord, ROAD)
				else if(coord.x > leftGrassEnd)
					px.set(coord, clipColor)
				else
					px.set(coord, grassColor)
			}
		}
	}

}