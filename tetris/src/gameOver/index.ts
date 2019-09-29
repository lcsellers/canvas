import { Vec } from 'lib/primitives'
import { GameState } from 'lib/engine'
import { Key } from 'lib/input'

const GameOver: GameState = ({ buttons }, engine, score) => {

	engine.setBindings({
		[Key.ENTER]: 'restart'
	})

	buttons.on('restart:up', () => engine.gameState('main'))

	return ({ draw }) => {
		draw.clear('white')
		draw.text('GAME OVER', new Vec(50, 50), 'black')
		draw.text('Final Score: ' + score, new Vec(45, 100), 'black')
	}
}

export default GameOver