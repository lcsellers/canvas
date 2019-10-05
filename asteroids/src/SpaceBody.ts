import { PixelBuffer } from 'lib/engine'
import { Vec, Rect, Polygon } from 'lib/primitives'
import { Color } from 'lib/color'

export default class SpaceBody {

	pos: Vec
	vel: Vec = new Vec(0, 0)
	angle = 0

	private poly: Polygon
	private color: Color
	protected bounds: Rect

	constructor(model: Polygon, color: Color, pos: Vec, screen: Vec) {
		this.pos = new Vec(pos)
		this.bounds = new Rect(screen)
		this.poly = model
		this.color = color
	}

	update(frameTime: number) {
		this.pos.add(Vec.mult(this.vel, 1/frameTime))
		if(this.bounds.includes(this.pos)) {
			return true
		} else {
			this.pos = this.bounds.wrap(this.pos)
			return false
		}
	}

	render(px: PixelBuffer) {
		this.poly.angle(this.angle)
		px.drawPolygon(this.poly, this.pos, this.color)
	}

}