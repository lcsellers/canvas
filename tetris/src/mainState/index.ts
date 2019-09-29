import { Vec } from 'lib/primitives'
import { GameState } from 'lib/engine'
import { Key } from 'lib/input'
import { randRange } from 'lib/random'

import Course from '../Course'
import Piece from '../Piece'

let FIELD_SIZE: Vec
let TILE_SIZE: number

const TetrisMain: GameState = ({ draw, buttons }, engine, fieldSize?: Vec, tileSize?: number) => {

	FIELD_SIZE = fieldSize || FIELD_SIZE || new Vec(10, 10)
	TILE_SIZE = tileSize || TILE_SIZE || 10

	const SCORE_PER_PIECE = 25
	const SCORE_PER_LINE = 100
	
	let score = 0
	
	let course: Course
	let current: Piece
	let preview: Piece
	
	let speed = 1000
	let piecesDropped = 0
	
	function randomPiece() {
		current = new Piece(randRange(0, 7), new Vec(3, 0))
		if(!course.fits(current)) {
			engine.gameState('gameOver', score)
		} else {
			calcPreview()
		}
	}
	
	function calcPreview() {
		preview = new Piece(current.shapeIndex, new Vec(current.pos.x, current.pos.y), current.rotation)
		while(course.fits(preview)) {
			preview.pos.y++
		}
		preview.pos.y--
	}
	
	function compact() {
		const lines = course.compact()
		const scorePer = SCORE_PER_LINE + (25 * (lines - 1))
		score += scorePer * lines
		calcPreview()
	}

	function drop() {
		current.pos.y++
		if(!course.fits(current)) {
			current.pos.y--
			if(course.set(current)) {
				engine.delay(compact, 500)
			}
			score += SCORE_PER_PIECE
			piecesDropped++
			if(piecesDropped % 5 === 0 && speed > 400) {
				speed -= 50
				forceDrop.changeSpeed(speed)
			}
			randomPiece()
		}
	}

	const forceDrop = engine.throttle(drop, speed)
	
	const userInput = engine.throttle((left: boolean, right: boolean, down: boolean) => {
		let change = 0
		if(left) change--
		if(right) change++
		
		if(change) {
			current.pos.x += change
			if(!course.fits(current)) {
				current.pos.x -= change
			} else {
				calcPreview()
			}
		}
	
		if(down) {
			drop()
		}
	}, 75)

	engine.setBindings({
		[Key.SPACE]: 'rotate',
		[Key.LEFT_ARROW]: 'left',
		[Key.RIGHT_ARROW]: 'right',
		[Key.DOWN_ARROW]: 'down',
		[Key.ENTER]: 'drop'
	})

	course = new Course(draw, FIELD_SIZE, new Vec(), TILE_SIZE)
	randomPiece()

	buttons.on('drop:down', () => {
		current.pos.y = preview.pos.y
		drop()
	})

	buttons.on('rotate:down', () => {
		current.rotation++
		if(!course.fits(current)) {
			current.rotation--
		} else {
			calcPreview()
		}
	})

	return ({ draw, buttons }) => {
		draw.clear('white')
		
		const [left, right, down] = [buttons.state('left'), buttons.state('right'), buttons.state('down')]
		if(left || right || down) {
			userInput(left, right, down)
		}
		
		forceDrop()
	
		course.render()
		course.renderPiece(preview, 0.35)
		course.renderPiece(current)
	
		draw.text(`Score: ${score}`, new Vec(135, 20), 'black')
	}

}

export default TetrisMain