import { DynamicObject } from 'lib/engine'
import { Vec, Rect, Polygon } from 'lib/primitives'
import { Color, Bitmap } from 'lib/Graphics'

export default class SpaceBody extends DynamicObject {

	pos: Vec
	vel: Vec = new Vec(0, 0)
	angle = 0

	private poly: Polygon
	private color: Color
	protected bounds: Rect

	constructor(model: Polygon, color: Color, pos: Vec) {
		super()
		this.pos = new Vec(pos)
		this.bounds = new Rect(this._d.size)
		this.poly = model
		this.color = color
	}

	update() {
		this.pos.add(Vec.mult(this.vel, 1/this._f.frameTime))
		if(this.bounds.includes(this.pos)) {
			return true
		} else {
			this.pos = this.bounds.wrap(this.pos)
			return false
		}
	}

	render(px: Bitmap) {
		this.poly.angle(this.angle)
		px.drawPolygon(this.poly, this.pos, this.color)
	}

}