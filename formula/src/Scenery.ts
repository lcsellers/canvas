import { Bitmap, rgb, GraphicsObject } from 'lib/graphics'
import { Vec } from 'lib/primitives'

const SKY1 = rgb(0, 0, 165)
const SKY2 = rgb(0, 0, 210)
const MOUNTAIN = rgb(117, 77, 0)

export default class Scenery extends GraphicsObject {

	static MAX_HILL_HEIGHT = 0.2

	draw(px: Bitmap, curve: number) {
		const halfHeight = this._d.size.y/2
		for(let x = 0; x < this._d.size.x; x++) {
			for(let y = 0; y < halfHeight; y++) {
				const hillHeight = Math.abs(Math.sin(x * 0.001 + (curve * 0.02))) * (this._d.size.y * Scenery.MAX_HILL_HEIGHT)
				let color = SKY2
				if(y > halfHeight - hillHeight)
					color = MOUNTAIN
				else if(y > halfHeight/2)
					color = SKY1
				px.set(new Vec(x, y), color)
			}
		}

	}

}