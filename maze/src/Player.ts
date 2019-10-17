import { Vec } from 'lib/primitives'
import { DynamicObject } from 'lib/engine'

export default class Player extends DynamicObject {

	static radius = 0.2
	static speed = 0.1

	pos: Vec
	mazeCell: Vec

	constructor(start: Vec) {
		super()
		this.pos = Vec.add(start, new Vec(0.5, 0.5))
		this.mazeCell = start
	}

	update(allowChange: (change: Vec, newCell: Vec) => boolean) {
		const velocity = new Vec
		if(this._f.btn('up')) {
			velocity.y -= Player.speed
		}
		if(this._f.btn('right')) {
			velocity.x += Player.speed
		}
		if(this._f.btn('down')) {
			velocity.y += Player.speed
		}
		if(this._f.btn('left')) {
			velocity.x -= Player.speed
		}

		const newPos = Vec.add(this.pos, velocity)
		const newCell = new Vec(Math.floor(newPos.x), Math.floor(newPos.y))
		const cellChange = Vec.sub(newCell, this.mazeCell)

		if((!cellChange.x && !cellChange.y) || allowChange(cellChange, newCell)) {
			this.pos = newPos
			this.mazeCell = newCell
		}

	}

	render(scale: number) {
		const center = Vec.mult(this.pos, scale)
		this._d.circle(center, Player.radius * scale, 'white')
		this._d.circle(center, 1, 'black')
	}

}