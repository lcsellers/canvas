import { Vec } from 'lib/primitives'
import { randInt } from 'lib/random'

export default class Streamer {

	private start!: number
	private end!: number
	private head!: number
	private tail!: number
	private length!: number

	constructor(private col: number, private height: number) {
		this.start = randInt(this.height * -0.25, this.height * 0.4)
		this.seed()
	}

	seed() {
		this.end = randInt(this.height * 0.6, this.height * 1.2)
		this.length = randInt(this.height * 0.4, this.height * 1.2)
		this.head = this.start
		this.tail = this.head - this.length
	}

	each(fn: (pos: Vec, head: boolean, remaining: number) => void) {
		for(let y = this.start; y <= this.head; y++) {
			if(y >= 0 && y < this.end && y < this.height && y >= this.tail) {
				fn(new Vec(this.col, y), y === this.head, y - this.tail)
			}
		}
	}

	drop() {
		this.head++
		this.tail++
		if(this.tail > this.end + 5) {
			this.start = randInt(this.height * -0.25, 0)
			this.seed()
		}
	}

}