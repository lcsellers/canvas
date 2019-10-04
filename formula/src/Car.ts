import { Vec } from 'lib/primitives'
import { Draw2D, SpriteSheet } from 'lib/engine'

export default class Car {

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

	constructor(private draw: Draw2D, img: HTMLImageElement, private trackLength: number) {
		this.carSheet = new SpriteSheet(img).dice(1, 9)
	}

	update(gas: boolean, left: boolean, right: boolean, trackCurvature: number, frameTime: number) {
		this.curveDiff = this.curvature - trackCurvature

		// acceleration/velocity
		if(gas) {
			this.speed += Car.ACCEL / frameTime
		} else {
			this.speed -= (Car.ACCEL * Car.DECEL) / frameTime
		}
		if(Math.abs(this.curveDiff) > 0.8) this.speed -= (Car.ACCEL * Car.OFF_TRACK) / frameTime

		if(this.speed < 0) this.speed = 0
		else if(this.speed > 1) this.speed = 1

		this.distance += (this.speed * Car.MAX_SPEED) / frameTime
		if(this.distance > this.trackLength) {
			this.distance %= this.trackLength
		}

		this.turning = 0
		// steering
		if(left) {
			this.turning--
			this.curvature -= (Car.MAX_TURN * (this.speed + 0.05)) / frameTime
		}
		if(right) {
			this.turning++
			this.curvature += (Car.MAX_TURN * (this.speed + 0.05)) / frameTime
		}
	}

	render(trackCurve: number) {
		const sprite = this.carSheet.sprite(4 + this.turning + Math.round(trackCurve * 3))
		const drawPos = new Vec(
			this.draw.size.x/2 + (this.curveDiff * this.draw.size.x / 2) - sprite.region.w/2,
			this.draw.size.y * Car.VPOS
		)
		this.draw.sprite(sprite, drawPos)
	}

}