import { vec } from 'lib/primitives'
import { GameState } from 'lib/engine'
import { Key } from 'lib/input'

const GameOver: GameState = ({ buttons }, engine, score) => {

	engine.setBindings({
		[Key.ENTER]: 'restart'
	})

	buttons.on('restart:up', () => engine.gameState('main'))

	return ({ draw }) => {
		draw.clear('white')
		draw.text('GAME OVER', vec(50, 50), 'black')
		draw.text('Final Score: ' + score, vec(45, 100), 'black')
	}
}

export default GameOver