import { Engine, PixelBuffer } from 'lib/engine'
import { Vec, Grid } from 'lib/primitives'
import { gray } from 'lib/color'
import { randBool } from 'lib/random'

const BLACK = gray(0)
const WHITE = gray(255)

new Engine('main')
	.setDimensions(new Vec(160, 100), 'fit')
	.createGameState('main', ({ draw }) => {

		const size = draw.size

		const px = new PixelBuffer(draw, size)
		let field: Grid<number>

		function seedRandom() {
			field = new Grid<number>(size).fill(() => randBool() ? 1 : 0)
		}

		// initializes a pattern (string array of 1s and 0s) to field's center
		function writePattern(pattern: string[]) {
			field = new Grid<number>(size).fill(() => 0)
			const start = new Vec(
				Math.floor(size.x / 2 - pattern[0].length / 2),
				Math.floor(size.y / 2 - pattern.length / 2)
			)
			for(let y = 0; y < pattern.length; y++) {
				for(let x = 0; x < pattern[y].length; x++) {
					field.set(Vec.add(start, new Vec(x, y)), parseInt(pattern[y][x], 10))
				}
			}
		}

		function countNeighbors(pos: Vec) {
			let neighbors = 0
			for(let y = -1; y <= 1; y++) {
				for(let x = -1; x <= 1; x++) {
					const n = Vec.add(pos, new Vec(x, y))
					// wrap
					if(n.x < 0) {
						n.x = size.x - 1
					} else if(n.x === size.x) {
						n.x = 0
					}
					if(n.y < 0) {
						n.y = size.y - 1
					} else if(n.y === size.y) {
						n.y = 0
					}

					neighbors += field.get(n)
				}
			}
			return neighbors - field.get(pos)
		}

		const patterns = [
			[],
			// R-pentomino
			[
				'011',
				'110',
				'010'
			],
			// Diehard
			[
				'00000010',
				'11000000',
				'01000111'
			],
			// Acorn
			[
				'0100000',
				'0001000',
				'1100111'
			],
			// Gosper glider gun
			[
				'000000000000000000000000100000000000',
				'000000000000000000000010100000000000',
				'000000000000110000001100000000000011',
				'000000000001000100001100000000000011',
				'110000000010000010001100000000000000',
				'110000000010001011000010100000000000',
				'000000000010000010000000100000000000',
				'000000000001000100000000000000000000',
				'000000000000110000000000000000000000',
			],
			// block laying switch engines
			[
				'00000010',
				'00001011',
				'00001010',
				'00001000',
				'00100000',
				'10100000'
			],
			[
				'11101',
				'10000',
				'00011',
				'01101',
				'10101'
			],
			['111111110111110001110000001111111011111']
		]

		document.addEventListener('keypress', e => {
			if(e.key === '0') {
				seedRandom()
			} else if(/[1234567]/.test(e.key)) {
				writePattern(patterns[parseInt(e.key, 10)])
			}
		})
		seedRandom()

		return () => {
			field = new Grid<number>(size).fill(pos => {
				const alive = field.get(pos)
				px.set(pos, alive ? WHITE : BLACK)
				// life
				const neighbors = countNeighbors(pos)
				return alive
					? neighbors > 1 && neighbors < 4 ? 1 : 0
					: neighbors === 3 ? 1 : 0
			})

			px.render()
		}
	})
	.setFps(20)
	.start()