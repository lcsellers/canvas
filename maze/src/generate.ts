import { GameState, PixelBuffer } from 'lib/engine'
import { Vec, Rect } from 'lib/primitives'
import { gray, hsl, rgb, colorString } from 'lib/color'
import { randInt } from 'lib/random'

import Maze from './Maze'

const FLOOR_COLOR = gray(175)
const WALL_COLOR = hsl(100, 0.5, 0.1)
const START_COLOR = rgb(0, 0, 255)
const GOAL_COLOR = rgb(255, 0, 0)

const VIEW_GENERATION = true

const generate: GameState = ({ draw }, engine, FIELD_SIZE: Vec, TILE_SIZE: number) => {

	const start = new Vec(randInt(0, FIELD_SIZE.x), randInt(0, FIELD_SIZE.y))
	const wallRgb = colorString(WALL_COLOR)

	const scale = new Vec(
		draw.size.x / ((FIELD_SIZE.x * TILE_SIZE) + 1),
		draw.size.y / ((FIELD_SIZE.y * TILE_SIZE) + 1)
	)

	const maze = new Maze(FIELD_SIZE, start)
	let generating = VIEW_GENERATION
	if(!generating) {
		while(maze.step()) {}
	}

	const px = new PixelBuffer(draw, draw.size)

	function drawTile(pos: Vec, [n, e, s, w]: boolean[]) {
		const origin = Vec.mult(pos, TILE_SIZE).add(new Vec(1, 1))
		let floor = FLOOR_COLOR
		if(pos.eq(maze.start)) floor = START_COLOR
		else if(pos.eq(maze.goal)) floor = GOAL_COLOR
		px.fill(new Rect(origin.x, origin.y, TILE_SIZE, TILE_SIZE), WALL_COLOR)
		px.fill(new Rect(origin.x, origin.y, TILE_SIZE - 1, TILE_SIZE - 1), floor)
		
		if(!s) px.fill(new Rect(origin.x, origin.y + TILE_SIZE - 1, TILE_SIZE - 1, 1), floor)
		if(!e) px.fill(new Rect(origin.x + TILE_SIZE - 1, origin.y, 1, TILE_SIZE - 1), floor)
	}

	return () => {
		maze.tiles.each((tile, pos) => {
			if(!tile) return
			drawTile(pos, tile)
		})

		draw.clear(wallRgb)
		px.render(new Vec, scale)

		if(!generating) {
			engine.gameState('solve', FIELD_SIZE, TILE_SIZE, scale, wallRgb, px, maze)
			return
		}

		generating = maze.step()
	}
}

export default generate