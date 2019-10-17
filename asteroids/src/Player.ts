import { Vec, Polygon } from 'lib/primitives'
import { colors } from 'lib/graphics'
import SpaceBody from './SpaceBody'

const model = [
	new Vec(0, -2),
	new Vec(1, 1.5),
	new Vec(0, 0.5),
	new Vec(-1, 1.5)
]

export default class Player extends SpaceBody {

	static TURN_SPEED = 1
	static ACC = 4

	constructor() {
		super(new Polygon(model).scale(new Vec(5, 5)), colors.white(), new Vec())
		this.pos = Vec.mult(this._d.size, 0.5)
	}

	update() {
		if(this._f.btn('left')) {
			this.angle -= Player.TURN_SPEED / this._f.frameTime
		}
		if(this._f.btn('right')) {
			this.angle += Player.TURN_SPEED / this._f.frameTime
		}
		if(this._f.btn('thrust')) {
			this.vel.add(Vec.fromAngle(this.angle).mult(Player.ACC / this._f.frameTime))
		}
		return super.update()
	}

}