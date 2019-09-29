import { Engine } from 'lib/engine'
import { vec } from 'lib/primitives'

import main from './mainState'
import gameOver from './gameOver'

const FIELD_SIZE = vec(10, 17)
const TILE_SIZE = 10

new Engine('main')
	.debug('fps')
	.setDimensions(vec.scale(vec.add(FIELD_SIZE, vec(6, 1)), TILE_SIZE), 'fit')
	.createGameState('main', main)
	.createGameState('gameOver', gameOver)
	.start('main', FIELD_SIZE, TILE_SIZE)