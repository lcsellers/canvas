import { GameState, PixelBuffer, Draw2D } from 'lib/engine'
import { Vector, vec } from 'lib/primitives'
import { Key } from 'lib/input'

import Maze from './Maze'

class Player {

	static radius = 0.2
	static speed = 0.1

	pos: Vector
	mazeCell: Vector

	constructor(private draw: Draw2D, start: Vector) {
		this.pos = vec.add(start, vec(0.5, 0.5))
		this.mazeCell = start
	}

	update(up: boolean, right: boolean, down: boolean, left: boolean, allowChange: (change: Vector, newCell: Vector) => boolean) {
		const velocity = vec(0, 0)
		if(up) {
			velocity.y -= Player.speed
		}
		if(right) {
			velocity.x += Player.speed
		}
		if(down) {
			velocity.y += Player.speed
		}
		if(left) {
			velocity.x -= Player.speed
		}

		const newPos = vec.add(this.pos, velocity)
		const newCell = vec(Math.floor(newPos.x), Math.floor(newPos.y))
		const cellChange = vec.sub(newCell, this.mazeCell)

		if((!cellChange.x && !cellChange.y) || allowChange(cellChange, newCell)) {
			this.pos = newPos
			this.mazeCell = newCell
		}

	}

	render(scale: number) {
		const center = vec.scale(this.pos, scale)
		this.draw.circle(center, Player.radius * scale, 'white')
		this.draw.circle(center, 1, 'black')
	}

}

const solve: GameState = ({ draw }, engine, FIELD_SIZE, TILE_SIZE, scale: Vector, wallRgb: string, px: PixelBuffer, maze: Maze) => {

	const player = new Player(draw, maze.start)

	engine.setBindings({
		[Key.UP_ARROW]: 'up',
		[Key.RIGHT_ARROW]: 'right',
		[Key.DOWN_ARROW]: 'down',
		[Key.LEFT_ARROW]: 'left'
	})

	return ({ buttons }) => {
		player.update(buttons.state('up'), buttons.state('right'), buttons.state('down'), buttons.state('left'), (change, newCell) => {
			const cell = maze.tiles.get(player.mazeCell)
			if(change.y === -1 && cell[0]) return false
			if(change.x === 1 && cell[1]) return false
			if(change.y === 1 && cell[2]) return false
			if(change.x === -1 && cell[3]) return false
			if(vec.eq(newCell, maze.goal)) {
				engine.gameState('generate', vec.add(FIELD_SIZE, vec(1, 1)), TILE_SIZE)
			}
			return true
		})

		draw.clear(wallRgb)
		px.render(vec(0, 0), scale)
		player.render(TILE_SIZE * scale.x)
	}

}

export default solve