import { Vec } from './Vec'

export class Polygon {

	private _angle = 0
	private _scale = new Vec(1, 1)

	constructor(public model: Vec[]) {}

	angle(a: number) {
		this._angle = a
		return this
	}

	scale(s: Vec) {
		this._scale = s
		return this
	}

	getTransformedVertices(translate: Vec) {
		return this.model.map(v => {
			v = new Vec(v)
			if(this._angle) v.rot(this._angle)
			return v.scale(this._scale).add(translate)
		})
	}

}