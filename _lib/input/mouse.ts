import { Vec } from '../primitives'

export function mousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vec {
	const rect = canvas.getBoundingClientRect()
	const root = document.documentElement
	return new Vec(
		e.clientX - rect.left - root.scrollLeft,
		e.clientY - rect.top - root.scrollTop
	)
}