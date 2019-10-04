import { GameState, PixelBuffer } from 'lib/engine'
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

	const px = new PixelBuffer(draw, draw.size)

	const track = new Track(draw.size, [
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
	const car = new Car(draw, images['car_green.png'], track.length)
	const scenery = new Scenery(draw.size)

	return ({ frameTime, buttons }) => {
		car.update(buttons.state('gas'), buttons.state('left'), buttons.state('right'), track.curvature, frameTime)
		track.update(frameTime, car.distance, car.speed)

		engine.debug('Dist', car.distance.toFixed(0) + '/' + track.length)
		engine.debug('Speed', car.speed.toFixed(2))
		engine.debug('Curve', track.curve.toFixed(2))
		engine.debug('Track Curvature', track.curvature.toFixed(2))
		engine.debug('Player Curvature', car.curvature.toFixed(2))

		scenery.draw(px, track.curvature)
		track.draw(px, car.distance)
		px.render()
		car.render(track.curve)
	}
}

export default game