import { Vector, vec } from './v2d'
import { Rect, rect } from './rect'

class GridOobError extends Error {
	constructor(coord: Vector) {
		super(`Grid out of bounds access: ${coord.x},${coord.y}`)
	}
}

export class Grid<T> {

	bounds: Rect
	private data: T[][]

	constructor(public size: Vector) {
		this.bounds = rect(0, 0, size.x - 1, size.y - 1)
		this.data = []
		for(let y = 0; y < size.y; y++) {
			this.data.push(new Array(size.x))
		}
	}

	get(pos: Vector) {
		if(!rect.collide(this.bounds, pos)) throw new GridOobError(pos)
		return this.data[pos.y][pos.x]
	}

	set(pos: Vector, cell: T) {
		if(!rect.collide(this.bounds, pos)) throw new GridOobError(pos)
		this.data[pos.y][pos.x] = cell
	}

	each(fn: (cell: T, pos: Vector) => void) {
		for(let y = 0; y < this.size.y; y++) {
			for(let x = 0; x < this.size.x; x++) {
				fn(this.data[y][x], vec(x, y))
			}
		}
	}

	fill(fn: (pos: Vector) => T) {
		this.each((cell, pos) => {
			this.set(pos, fn(pos))
		})
		return this
	}

}