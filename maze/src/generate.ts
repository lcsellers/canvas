import { GameState, PixelBuffer } from 'lib/engine'
import { Vector, vec, rect } from 'lib/primitives'
import { gray, hsl, rgb, colorString } from 'lib/color'
import { randRange } from 'lib/random'

import Maze from './Maze'

const FLOOR_COLOR = gray(175)
const WALL_COLOR = hsl(100, 0.5, 0.1)
const START_COLOR = rgb(0, 0, 255)
const GOAL_COLOR = rgb(255, 0, 0)

const VIEW_GENERATION = true

const generate: GameState = ({ draw }, engine, FIELD_SIZE: Vector, TILE_SIZE: number) => {

	const start = vec(randRange(0, FIELD_SIZE.x), randRange(0, FIELD_SIZE.y))
	const wallRgb = colorString(WALL_COLOR)

	const scale = vec(
		draw.size.x / ((FIELD_SIZE.x * TILE_SIZE) + 1),
		draw.size.y / ((FIELD_SIZE.y * TILE_SIZE) + 1)
	)

	const maze = new Maze(FIELD_SIZE, start)
	let generating = VIEW_GENERATION
	if(!generating) {
		while(maze.step()) {}
	}

	const px = new PixelBuffer(draw, draw.size)

	function drawTile(pos: Vector, [n, e, s, w]: boolean[]) {
		const origin = vec.add(vec.scale(pos, TILE_SIZE), vec(1, 1))
		let floor = FLOOR_COLOR
		if(vec.eq(pos, maze.start)) floor = START_COLOR
		if(vec.eq(pos, maze.goal)) floor = GOAL_COLOR
		px.fill(rect(origin.x, origin.y, TILE_SIZE, TILE_SIZE), WALL_COLOR)
		px.fill(rect(origin.x, origin.y, TILE_SIZE - 1, TILE_SIZE - 1), floor)
		
		if(!s) px.fill(rect(origin.x, origin.y + TILE_SIZE - 1, TILE_SIZE - 1, 1), floor)
		if(!e) px.fill(rect(origin.x + TILE_SIZE - 1, origin.y, 1, TILE_SIZE - 1), floor)
	}

	return () => {
		maze.tiles.each((tile, pos) => {
			if(!tile) return
			drawTile(pos, tile)
		})

		draw.clear(wallRgb)
		px.render(vec(0, 0), scale)

		if(!generating) {
			engine.gameState('solve', FIELD_SIZE, TILE_SIZE, scale, wallRgb, px, maze)
			return
		}

		generating = maze.step()
	}
}

export default generate