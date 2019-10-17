import { GameState } from 'lib/engine'
import { Bitmap } from 'lib/graphics'
import { Key } from 'lib/input'

import Car from './Car'
import Track from './Track'
import Scenery from './Scenery'

const game: GameState = ({ draw, images }, engine) => {
	
	engine.setBindings({
		[Key.UP_ARROW]: 'gas',
		[Key.LEFT_ARROW]: 'left',
		[Key.RIGHT_ARROW]: 'right'
	})

	const px = new Bitmap(draw.size)

	const track = new Track([
		[10, 0],
		[200, 0],
		[200, 1],
		[400, 0],
		[100, -1],
		[200, 0],
		[200, -1],
		[200, 1],
		[200, 1],
		[500, 0.2],
		[200, 0]
	])
	const car = new Car(images['car_green.png'], track.length)
	const scenery = new Scenery()

	return () => {
		car.update(track.curvature)
		track.update(car.distance, car.speed)

		engine.debug('Dist', car.distance.toFixed(0) + '/' + track.length)
		engine.debug('Speed', car.speed.toFixed(2))
		engine.debug('Curve', track.curve.toFixed(2))
		engine.debug('Track Curvature', track.curvature.toFixed(2))
		engine.debug('Player Curvature', car.curvature.toFixed(2))

		scenery.draw(px, track.curvature)
		track.draw(px, car.distance)
		draw.bitmap(px)
		car.render(track.curve)
	}
}

export default game