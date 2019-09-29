import { Engine } from 'lib/engine'
import { vec } from 'lib/primitives'

const SCREEN = vec(500, 500)

const FIELD_SIZE = vec(4, 4)
const TILE_SIZE = 5

import solve from './solve'
import generate from './generate'

new Engine('main')
	.debug('fps')
	.setDimensions(SCREEN, 'fit')
	.createGameState('generate', generate)
	.createGameState('solve', solve)
	.setClear('black')
	.start('generate', FIELD_SIZE, TILE_SIZE)