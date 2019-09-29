import { Vec } from './Vec'
import { Rect } from './Rect'

class GridOobError extends Error {
	constructor(coord: Vec) {
		super(`Grid out of bounds access: ${coord.x},${coord.y}`)
	}
}

export class Grid<T> {

	bounds: Rect
	private data: T[][]

	constructor(public size: Vec) {
		this.bounds = new Rect(0, 0, size.x - 1, size.y - 1)
		this.data = []
		for(let y = 0; y < size.y; y++) {
			this.data.push(new Array(size.x))
		}
	}

	get(pos: Vec) {
		if(!this.bounds.includes(pos)) throw new GridOobError(pos)
		return this.data[pos.y][pos.x]
	}

	set(pos: Vec, cell: T) {
		if(!this.bounds.includes(pos)) throw new GridOobError(pos)
		this.data[pos.y][pos.x] = cell
	}

	each(fn: (cell: T, pos: Vec) => void) {
		for(let y = 0; y < this.size.y; y++) {
			for(let x = 0; x < this.size.x; x++) {
				fn(this.data[y][x], new Vec(x, y))
			}
		}
	}

	fill(fn: (pos: Vec) => T) {
		this.each((cell, pos) => {
			this.set(pos, fn(pos))
		})
		return this
	}

}