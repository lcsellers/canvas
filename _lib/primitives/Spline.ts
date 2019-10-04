import { Vec } from './Vec'

export class Spline {

	constructor(public points: Vec[], public loop = false) {}

	getCoord(t: number) {
		const [p0, p1, p2, p3] = this.calcControlPoints(t)
		t = t - Math.floor(t)

		const tt = t * t
		const ttt = tt * t

		const q0 = -ttt + 2*tt - t
		const q1 = 3*ttt - 5*tt + 2
		const q2 = -3*ttt + 4*tt + t
		const q3 = ttt - tt

		const tx = 0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3)
		const ty = 0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3)
		
		return new Vec(tx, ty)
	}

	getAngle(t: number) {
		const [p0, p1, p2, p3] = this.calcControlPoints(t)
		t = t - Math.floor(t)

		const tt = t * t

		const q0 = -3*tt + 4*t - 1
		const q1 = 9*tt - 10*t;
		const q2 = -9*tt + 8*t + 1;
		const q3 = 3*tt - 2*t;

		const tx = 0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3)
		const ty = 0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3)

		return new Vec(tx, ty)
	}

	private calcControlPoints(t: number): Vec[] {
		let p0, p1, p2, p3
		if(this.loop) {
			p1 = Math.floor(t)
			p2 = (p1 + 1) % this.points.length
			p3 = (p1 + 2) % this.points.length
			p0 = p1 >= 1 ? p1 - 1 : this.points.length - 1
		} else {
			p1 = Math.floor(t) + 1
			p2 = p1 + 1
			p3 = p1 + 2
			p0 = p1 - 1
		}
		return [this.points[p0], this.points[p1], this.points[p2], this.points[p3]]
	}

}