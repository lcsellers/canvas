import { Vec } from 'lib/primitives'
import { SpriteSheet } from 'lib/graphics'
import { DynamicObject } from 'lib/engine'

export default class Car extends DynamicObject {

	static VPOS = 0.8 // how far down the screen to draw
	static MAX_SPEED = 50
	static MAX_TURN = 0.7
	static ACCEL = 1
	static DECEL = 0.4 // percentage of acceleration
	static OFF_TRACK = 2 // percentage of acceleration

	// from -1 (far left) to 1 (far right)
	curveDiff = 0
	distance = 0
	acc = 0
	speed = 0
	curvature = 0

	private carSheet: SpriteSheet
	private turning = 0

	constructor(img: HTMLImageElement, private trackLength: number) {
		super()
		this.carSheet = new SpriteSheet(img, 9, 1)
	}

	update(trackCurvature: number) {
		this.curveDiff = this.curvature - trackCurvature

		// acceleration/velocity
		if(this._f.btn('gas')) {
			this.speed += Car.ACCEL / this._f.frameTime
		} else {
			this.speed -= (Car.ACCEL * Car.DECEL) / this._f.frameTime
		}
		if(Math.abs(this.curveDiff) > 0.8) this.speed -= (Car.ACCEL * Car.OFF_TRACK) / this._f.frameTime

		if(this.speed < 0) this.speed = 0
		else if(this.speed > 1) this.speed = 1

		this.distance += (this.speed * Car.MAX_SPEED) / this._f.frameTime
		if(this.distance > this.trackLength) {
			this.distance %= this.trackLength
		}

		this.turning = 0
		// steering
		if(this._f.btn('left')) {
			this.turning--
			this.curvature -= (Car.MAX_TURN * (this.speed + 0.05)) / this._f.frameTime
		}
		if(this._f.btn('right')) {
			this.turning++
			this.curvature += (Car.MAX_TURN * (this.speed + 0.05)) / this._f.frameTime
		}
	}

	render(trackCurve: number) {
		const sprite = this.carSheet.get(4 + this.turning + Math.round(trackCurve * 3))
		const drawPos = new Vec(
			this._d.size.x/2 + (this.curveDiff * this._d.size.x / 2) - sprite.size.x/2,
			this._d.size.y * Car.VPOS
		)
		this._d.image(sprite, drawPos)
	}

}