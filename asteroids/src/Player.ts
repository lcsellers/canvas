import { Vec, Polygon } from 'lib/primitives'
import { colors } from 'lib/color'
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

	constructor(screen: Vec) {
		const poly = new Polygon(model).scale(new Vec(5, 5))
		super(poly, colors.white(), Vec.mult(screen, 0.5), screen)
	}

	input(left: boolean, right: boolean, thrust: boolean, frameTime: number) {
		if(left) {
			this.angle -= Player.TURN_SPEED / frameTime
		}
		if(right) {
			this.angle += Player.TURN_SPEED / frameTime
		}
		if(thrust) {
			this.vel.add(Vec.fromAngle(this.angle).mult(Player.ACC / frameTime))
		}
		super.update(frameTime)
	}

}