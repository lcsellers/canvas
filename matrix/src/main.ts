import { Engine, PixelBuffer, GlyphSet, Text } from 'lib/engine'
import { Vec, Rect, Grid } from 'lib/primitives'
import { colors, gray, rgb } from 'lib/color'
import { randInt, randFloat } from 'lib/random'

import Streamer from './Streamer'

const HEAD = colors.white()
const BG = colors.black()

const SIZE = new Vec(80, 20)
const TILE = new Vec(32, 32)

new Engine('main')
	.setDimensions(Vec.scale(SIZE, TILE), 'stretch')
	.createGameState('main', ({ draw }, engine) => {

		const glyphs = new GlyphSet(32)
			.add(192, 496)
			.add(0x3041, 0x3097)
			.add(0x30A1, 0x30FB)
		const px = new PixelBuffer(draw, draw.size)
		px.clear(BG)

		// set up initial char field and streamers
		const chars = new Grid<number>(SIZE)
		const brightness = new Grid<number>(SIZE)
		const streamers: Streamer[] = []
		
		for(let x = 0; x < SIZE.x; x++) {
			streamers.push(new Streamer(x, SIZE.y))
			for(let y = 0; y < SIZE.y; y++) {
				const pos = new Vec(x, y)
				chars.set(pos, randInt(0, glyphs.length))
				brightness.set(pos, randInt(100, 255))
			}
		}

		function drawChar(pos: Vec, head: boolean, remaining: number) {
			const origin = Vec.scale(pos, TILE)
			let color = head ? HEAD : rgb(0, brightness.get(pos), 0)
			px.drawGlyph(glyphs.get(chars.get(pos)), origin, color)
			if(remaining < 5) {
				px.fill(new Rect(origin.x, origin.y, TILE.x, TILE.y), rgb(0, 0, 0, 1 - 0.15 * remaining))
			}
		}

		// draw initial visible chars
		streamers.forEach(s => s.each(drawChar))
		px.render()

		const drop = engine.throttle(() => {
			px.clear()
			streamers.forEach(s => {
				s.drop()
				s.each(drawChar)
			})
		}, 50)

		return () => {
			drop()
			streamers.forEach(s => s.each((pos, head, remaining) => {
				if(randFloat() < 0.25) {
					chars.set(pos, randInt(0, glyphs.length))
					px.fill(new Rect(pos.x * TILE.x, pos.y * TILE.y, TILE.x, TILE.y), BG)
					drawChar(pos, head, remaining)
				}
			}))
			px.render()
		}
	})
	.start()