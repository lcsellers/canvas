import { Vec, Polygon } from 'lib/primitives'
import { colors } from 'lib/graphics'

import SpaceBody from './SpaceBody'

export default class Bullet extends SpaceBody {

	static SPEED = 15

	constructor(pos: Vec, angle: number) {
		super(new Polygon([new Vec(0, 0)]), colors.white(), pos)
		this.vel = Vec.fromAngle(angle).mult(Bullet.SPEED)
	}

}