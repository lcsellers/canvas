import { Vec, Rect } from 'lib/primitives'
import { Draw2D } from 'lib/engine'

import Piece from './Piece'
import { colors } from './tetrimino'

export default class Course {

	private data: Array<number | undefined>
	private lines: number[] = []

	constructor(private draw: Draw2D, public size: Vec, private pos: Vec, private tileSize: number) {
		this.data = new Array(size.x * size.y)
	}

	fits(p: Piece) {
		for(let y = 0; y < 4; y++) {
			for(let x = 0; x < 4; x++) {
				const pieceCoord = new Vec(x, y)
				if(!p.getTile(pieceCoord)) continue
				const c = Vec.add(p.pos, pieceCoord)
				if(c.x < 0 || c.x >= this.size.x || c.y < 0 || c.y >= this.size.y || this.data[c.y * this.size.x + c.x] != undefined) {
					return false
				}
			}
		}
		return true
	}

	set(p: Piece) {
		this.forPieceGrid(pieceCoord => {
			if(!p.getTile(pieceCoord)) return
			const c = Vec.add(p.pos, pieceCoord)
			this.data[c.y * this.size.x + c.x] = p.shapeIndex
		})

		for(let i = 0; i < 4; i++) {
			const y = p.pos.y + i
			if(this.checkForLine(y)) {
				this.lines.push(y)
				this.eraseLine(y)
			}
		}
		return this.lines.length
	}

	compact() {
		this.lines.forEach(y => this.shiftDown(y))
		const numLines = this.lines.length
		this.lines = []
		return numLines
	}

	renderPiece(p: Piece, opacity: number = 1) {
		this.forPieceGrid(coord => {
			if(p.getTile(coord)) {
				const r = new Rect(
					this.pos.x + this.tileSize + ((p.pos.x + coord.x) * this.tileSize),
					this.pos.y + ((p.pos.y + coord.y) * this.tileSize),
					this.tileSize,
					this.tileSize
				)
				this.draw.rect(r, p.color, { color: 'black', width: 0.2 })
				if(opacity < 1) {
					this.draw.rect(r, `rgba(0, 0, 0, ${1 - opacity})`)
				}
			}
		})
	}

	render() {
		this.draw.rect(new Rect(this.pos.x, this.pos.y, (this.size.x + 2) * this.tileSize, (this.size.y + 1) * this.tileSize), 'silver')
		this.draw.rect(new Rect(this.pos.x + this.tileSize, 0, this.size.x * this.tileSize, this.size.y * this.tileSize), 'black')
		this.data.forEach((tile, i) => {
			if(tile == undefined) return
			const coord = new Vec(i % this.size.x, Math.floor(i / this.size.x))
			this.draw.rect(new Rect(
				this.pos.x + ((coord.x + 1) * this.tileSize),
				this.pos.y + (coord.y * this.tileSize),
				this.tileSize,
				this.tileSize
			), 'black', { color: colors[tile], width: 3 })
		})
	}

	private forPieceGrid(fn: (coord: Vec) => void) {
		for(let y = 0; y < 4; y++) {
			for(let x = 0; x < 4; x++) {
				fn(new Vec(x, y))
			}
		}
	}

	private checkForLine(y: number) {
		const start = y * this.size.x
		for(let i = start; i < start + this.size.x; i++) {
			if(this.data[i] == undefined) return false
		}
		return true
	}

	private eraseLine(y: number) {
		const start = y * this.size.x
		for(let i = start; i < start + this.size.x; i++) {
			this.data[i] = undefined
		}
	}

	private shiftDown(y: number) {
		const start = ((y+1) * this.size.x) - 1
		for(let i = start; i >= 0; i--) {
			const rowAbove = i - this.size.x
			this.data[i] = rowAbove > 0 ? this.data[rowAbove] : undefined
		}
	}

}