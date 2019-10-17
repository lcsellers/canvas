import { Vec } from 'lib/primitives'
import { Text } from 'lib/graphics'
import { GameState } from 'lib/engine'
import { Key } from 'lib/input'

const GameOver: GameState = ({ draw, buttons }, engine, score) => {

	engine.setBindings({
		[Key.ENTER]: 'restart'
	})

	buttons.on('restart:up', () => engine.state('main'))

	const gameOverText = new Text('GAME OVER').origin('top center')
	const scoreText = new Text('Final Score: ' + score).origin('top center')

	return () => {
		draw.clear('white')
		draw.text(new Vec(draw.size.x/2, 50), gameOverText)
		draw.text(new Vec(draw.size.x/2, 100), scoreText)
	}
}

export default GameOver