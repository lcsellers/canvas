import { Collection, EventEmitter } from 'lib/util'
import { ScaleType, Color } from 'lib/graphics'
import { Vec } from 'lib/primitives'
import { Bindings } from 'lib/input'

export type Debugger = 'fps'

interface Throttled {
	(...args: any[]): void
	reset: () => void
	changeSpeed: (newMs: number) => void
}

export abstract class CanvasEngine extends EventEmitter {
	
	abstract debug(key: string, val: any): void

	abstract images: Collection<HTMLImageElement>
	abstract loadImages(...images: string[]): Promise<Collection<HTMLImageElement>>

	abstract state(state: string, ...args: any[]): void
	abstract pause(paused?: boolean): CanvasEngine
	abstract paused: boolean

	abstract throttle(fn: Function, ms: number): Throttled
	abstract delay(fn: Function, ms: number): () => void

	abstract useMouse(use?: boolean): CanvasEngine
	abstract setDimensions(dim?: Vec, scale?: ScaleType): CanvasEngine
	abstract setInternalDebugging(...debuggers: Debugger[]): CanvasEngine
	abstract setBindings(bindings: Bindings): CanvasEngine
	abstract setClear(color: string): CanvasEngine
	abstract setFps(fps: number): CanvasEngine

	abstract setDefaultFont(font: string): CanvasEngine
	abstract setDefaultTextSize(size: number): CanvasEngine
	abstract setDefaultTextWeight(weight: string): CanvasEngine
	abstract setDefaultTextStyle(style: string): CanvasEngine
	abstract setDefaultTextColor(fg: Color, bg?: Color): CanvasEngine
	abstract setDefaultTextBackground(bg: Color): CanvasEngine

}

export interface Timing {

	throttle: (fn: Function, ms: number) => Throttled

	delay: (fn: Function, ms: number) => () => void

}

export interface FrameState {

	frameTime: number
	btn: (binding: string) => boolean
	mouse: Vec

}

export interface ButtonEvents {

	on: (event: string, handler: Function) => void
	off: (event: string, handler: Function) => void

}