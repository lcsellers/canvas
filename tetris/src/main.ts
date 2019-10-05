import { Engine } from 'lib/engine'
import { Vec } from 'lib/primitives'

import main from './mainState'
import gameOver from './gameOver'

const FIELD_SIZE = new Vec(10, 17)
const TILE_SIZE = 10

new Engine('main')
	.setInternalDebugging('fps')
	.setDimensions(Vec.add(FIELD_SIZE, new Vec(6, 1)).mult(TILE_SIZE), 'fit')
	.createGameState('main', main)
	.createGameState('gameOver', gameOver)
	.start('main', FIELD_SIZE, TILE_SIZE)