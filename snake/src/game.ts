import { Vector, vec, rect } from 'lib/primitives'
import { GameState } from 'lib/engine'
import { Key } from 'lib/input'
import { randRange } from 'lib/random'

const SnakeGame: GameState = (state, engine, FIELD_SIZE: Vector) => {

	const START_SPEED = 400

	let snake: Vector[]
	let fruit: Vector
	let dir: Vector
	let speed: number

	function placeFruit() {
		do {
			fruit = vec(randRange(0, FIELD_SIZE.x), randRange(0, FIELD_SIZE.y))
		} while(snake.some(segment => vec.eq(segment, fruit)))
	}

	function reset() {
		snake = [vec(Math.floor(FIELD_SIZE.x/2), Math.floor(FIELD_SIZE.y/2))]
		dir = vec(0, -1)
		speed = START_SPEED
		move.changeSpeed(speed)
		placeFruit()
	}
	
	const move = engine.throttle(() => {

		const newSegment = vec.add(snake[0], dir)
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

		if(snake.some(segment => vec.eq(segment, newSegment))) {
			reset()
		}

		snake.unshift(newSegment)

		if(vec.eq(newSegment, fruit)) {
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

	return ({ draw, buttons }) => {
		if(buttons.state('up') && dir.x !== 0) {
			dir = vec(0, -1)
		} else if(buttons.state('down') && dir.x !== 0) {
			dir = vec(0, 1)
		} else if(buttons.state('left') && dir.y !== 0) {
			dir = vec(-1, 0)
		} else if(buttons.state('right') && dir.y !== 0) {
			dir = vec(1, 0)
		}

		move()

		draw.clear('black')
		draw.rect(rect(fruit.x, fruit.y, 1, 1), 'red')
		snake.forEach(segment => {
			draw.rect(rect(segment.x, segment.y, 1, 1), 'green')
		})
	}
}

export default SnakeGame