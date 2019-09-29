import { Vector, Collection } from 'lib/primitives'

import * as tetrimino from './tetrimino'

export default class Piece {

	shapeIndex: number
	shape: string
	color: string

	constructor(shape: number, public pos: Vector, public rotation: number = 0) {
		this.shapeIndex = shape % 7
		this.shape = tetrimino.shapes[this.shapeIndex]
		this.color = tetrimino.colors[this.shapeIndex]
	}

	getTile(at: Vector) {
		switch(this.rotation % 4) {
			case 0:
				return this.shape[at.y * 4 + at.x] === 'o'
			case 1:
				return this.shape[(12 - 4 * at.x) + at.y] === 'o'
			case 2:
				return this.shape[(15 - 4 * at.y) - at.x] === 'o'
			case 3:
				return this.shape[(3 + 4 * at.x) - at.y] === 'o'
		}
	}

}
