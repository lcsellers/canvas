import { Vec, Polygon } from 'lib/primitives'
import { colors } from 'lib/color'
import { randFloat, randBool } from 'lib/random'

import SpaceBody from './SpaceBody'

export default class Asteroid extends SpaceBody {

	static SPEED = 6
	radius: number

	private spin: number

	constructor(screen: Vec, pos: Vec, radius: number) {
		let vertices: Vec[] = []
		for(let a = 0; a < Math.PI*2; a += Math.PI/8) {
			const rand = radius + (radius * randFloat(0, 0.3))
			vertices.push(Vec.fromAngle(a).mult(rand))
		}
		super(new Polygon(vertices), colors.white(), pos, screen)
		this.radius = radius
		this.spin = randFloat(0.3, 0.8) * (randBool() ? 1 : -1)
		this.vel = Vec.fromAngle(randFloat(0, Math.PI * 2)).mult(Asteroid.SPEED)
	}

	collide(point: Vec) {
		return this.pos.dist(point) <= this.radius
	}

	update(frameTime: number) {
		this.angle += this.spin / frameTime
		return super.update(frameTime)
	}

}