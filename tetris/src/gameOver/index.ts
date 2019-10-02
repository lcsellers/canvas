import { Vec } from 'lib/primitives'
import { GameState } from 'lib/engine'
import { Key } from 'lib/input'

const GameOver: GameState = ({ buttons }, engine, score) => {

	engine.setBindings({
		[Key.ENTER]: 'restart'
	})

	buttons.on('restart:up', () => engine.gameState('main'))

	const gameOverText = engine.createText('GAME OVER').origin('top center')
	const scoreText = engine.createText('Final Score: ' + score).origin('top center')

	return ({ draw }) => {
		draw.clear('white')
		draw.text(new Vec(draw.size.x/2, 50), gameOverText)
		draw.text(new Vec(draw.size.x/2, 100), scoreText)
	}
}

export default GameOver