import { Engine } from 'lib/engine'
import { Vec } from 'lib/primitives'

import mainState from './game'

new Engine('main')
	.setDimensions(new Vec(320, 200), 'fit')
	.setInternalDebugging('fps')
	.preload('car_green.png')
	.createGameState('main', mainState)
	.start()