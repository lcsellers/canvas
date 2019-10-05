import { Vec, Rect } from 'lib/primitives'
import { GameState, PixelBuffer } from 'lib/engine'
import { Key } from 'lib/input'
import { randInt } from 'lib/random'
import { colors, hsl } from 'lib/color'

const SnakeGame: GameState = ({ draw }, engine, FIELD_SIZE: Vec) => {

	const START_SPEED = 400

	const BG = colors.black()
	const SNAKE_HEAD = hsl(124, 0.67, 0.6)
	const SNAKE_BODY = hsl(124, 0.67, 0.8)
	const FRUIT = colors.red()

	let px = new PixelBuffer(draw, FIELD_SIZE)

	let snake: Vec[]
	let fruit: Vec
	let dir: Vec
	let nextDir: Vec
	let speed: number

	function placeFruit() {
		do {
			fruit = new Vec(randInt(0, FIELD_SIZE.x), randInt(0, FIELD_SIZE.y))
		} while(snake.some(segment => segment.eq(fruit)))
	}

	function reset() {
		snake = [new Vec(Math.floor(FIELD_SIZE.x/2), Math.floor(FIELD_SIZE.y/2))]
		dir = new Vec(0, -1)
		nextDir = new Vec(0, -1)
		speed = START_SPEED
		move.changeSpeed(speed)
		placeFruit()
	}
	
	const move = engine.throttle(() => {

		// prevent changing to inputted direction if it is directly opposite the current dir
		if((dir.x === 0 || nextDir.x === 0) && (dir.y === 0 || nextDir.y === 0)) {
			dir = nextDir
		}

		const newSegment = Vec.add(snake[0], dir)
		if(newSegment.x < 0) {
			newSegment.x = FIELD_SIZE.x - 1
		} else if(newSegment.x >= FIELD_SIZE.x) {
			newSegment.x = 0
		}
		if(newSegment.y < 0) {
			newSegment.y = FIELD_SIZE.y - 1
		} else if(newSegment.y >= FIELD_SIZE.y) {
			newSegment.y = 0
		}

		if(snake.some(segment => segment.eq(newSegment))) {
			reset()
		}

		snake.unshift(newSegment)

		if(newSegment.eq(fruit)) {
			placeFruit()
			if(speed > 100) {
				speed -= 10
				move.changeSpeed(speed)
			}
		} else {
			snake.pop()
		}

	}, START_SPEED)
	
	engine.setBindings({
		[Key.UP_ARROW]: 'up',
		[Key.RIGHT_ARROW]: 'right',
		[Key.DOWN_ARROW]: 'down',
		[Key.LEFT_ARROW]: 'left'
	})

	reset()

	return ({ buttons }) => {
		engine.debug('speed', speed)

		if(buttons.state('up')) {
			nextDir = new Vec(0, -1)
		} else if(buttons.state('down')) {
			nextDir = new Vec(0, 1)
		} else if(buttons.state('left')) {
			nextDir = new Vec(-1, 0)
		} else if(buttons.state('right')) {
			nextDir = new Vec(1, 0)
		}

		move()

		px.clear(BG)
		px.set(fruit, FRUIT)
		snake.forEach((segment, i) => {
			px.set(segment, i ? SNAKE_BODY : SNAKE_HEAD)
		})

		px.render()
	}
}

export default SnakeGame