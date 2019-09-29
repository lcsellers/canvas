import { Engine } from 'lib/engine'
import { Vec } from 'lib/primitives'

import main from './game'

const FIELD_SIZE = new Vec(15, 15)

new Engine('main')
	.debug('fps')
	.setDimensions(FIELD_SIZE, 'fit')
	.createGameState('main', main)
	// .createGameState('gameOver', gameOver)
	.start('main', FIELD_SIZE)