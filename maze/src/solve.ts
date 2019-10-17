import { GameState } from 'lib/engine'
import { Vec } from 'lib/primitives'
import { Key } from 'lib/input'
import { Bitmap } from 'lib/graphics'

import Maze from './Maze'
import Player from './Player'

const solve: GameState = ({ draw }, engine, FIELD_SIZE, TILE_SIZE, scale: Vec, wallRgb: string, px: Bitmap, maze: Maze) => {

	const player = new Player(maze.start)

	engine.setBindings({
		[Key.UP_ARROW]: 'up',
		[Key.RIGHT_ARROW]: 'right',
		[Key.DOWN_ARROW]: 'down',
		[Key.LEFT_ARROW]: 'left'
	})

	return () => {
		player.update((change, newCell) => {
			const cell = maze.tiles.get(player.mazeCell)
			if(change.y === -1 && cell[0]) return false
			if(change.x === 1 && cell[1]) return false
			if(change.y === 1 && cell[2]) return false
			if(change.x === -1 && cell[3]) return false
			if(newCell.eq(maze.goal)) {
				engine.state('generate', Vec.add(FIELD_SIZE, new Vec(1, 1)), TILE_SIZE)
			}
			return true
		})

		draw.clear(wallRgb)
		draw.bitmap(px, new Vec(), scale)
		player.render(TILE_SIZE * scale.x)
	}

}

export default solve