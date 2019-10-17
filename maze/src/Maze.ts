import { Vec, Grid } from 'lib/primitives'
import { randElement } from 'lib/util'

// true indicates a wall in that direction
type MazeTile = boolean[]

interface Neighbor {
	pos: Vec
	dir: number
}

export default class Maze {

	tiles: Grid<MazeTile>
	backtracking = false

	start: Vec
	goal: Vec

	private stack: Vec[] = []
	private visited = 1
	private target: number

	constructor(size: Vec, start: Vec = new Vec()) {
		this.tiles = new Grid<MazeTile>(size)
		this.target = size.x * size.y
		this.stack.unshift(start)
		this.start = start
		this.goal = start
		this.tiles.set(start, this.newMazeTile())

		// select a current position
		// get a list of neighboring, unvisited tiles
		// if the list has items
		//		pick one at random
		//		make a connection between it and the current tile
		//		push it onto the stack
		//		increment visited
		//		if visited == total
		//			done
		//		else
		//			start from (2) with it
		// else
		//		pop the stack
		//		go to (2)
	}

	step() {
		const current = this.stack[0]
		const neighbors = this.getNeighbors(current)

		if(!neighbors.length) {
			this.stack.shift()
			this.backtracking = true
			this.goal = current
			return true
		}
		this.backtracking = false

		const next = randElement(neighbors)
		
		const newTile = this.newMazeTile()
		
		newTile[(next.dir + 2) % 4] = false
		this.tiles.set(next.pos, newTile)
		this.tiles.get(current)[next.dir] = false

		this.stack.unshift(next.pos)
		this.goal = next.pos

		this.visited++
		return this.visited < this.target
	}

	private getNeighbors(pos: Vec): Neighbor[] {
		const neighbors: Neighbor[] = []

		for(let dir = 0; dir < 4; dir++) {
			// math to turn 0-4 representing NESW into vector representing dir
			const neighbor = new Vec(
				pos.x + (dir % 2 ? (dir - 2) * -1 : 0),
				pos.y + (dir % 2 ? 0 : dir - 1)
			)
			if(this.tiles.bounds.includes(neighbor) && !this.tiles.get(neighbor)) neighbors.push({ pos: neighbor, dir })
		}

		return neighbors
	}

	private newMazeTile(): MazeTile {
		return [true, true, true, true]
	}

}