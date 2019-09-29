import { Vector, vec } from '../primitives'

export function mousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vector {
	const rect = canvas.getBoundingClientRect()
	const root = document.documentElement
	return vec(
		e.clientX - rect.left - root.scrollLeft,
		e.clientY - rect.top - root.scrollTop
	)
}