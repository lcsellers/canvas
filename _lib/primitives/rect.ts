import { Vector } from './v2d'

interface Rect {
	x: number
	y: number
	w: number
	h: number
}

const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h })
rect.collide = (rect: Rect, point: Vector) => {
	return	point.x >= rect.x &&
			point.x <= rect.x + rect.w &&
			point.y >= rect.y &&
			point.y <= rect.y + rect.h
}

export {
	Rect,
	rect
}