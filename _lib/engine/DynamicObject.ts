import { GraphicsObject } from 'lib/graphics'
import { Timing, FrameState, ButtonEvents } from './CanvasEngine'

export abstract class DynamicObject extends GraphicsObject {

	static DEBUG: (key: string, value: any) => void
	static TIMING: Timing
	static FRAME: FrameState
	static BUTTON: ButtonEvents

	protected debug: (key: string, value: any) => void = DynamicObject.DEBUG
	protected _t: Timing = DynamicObject.TIMING
	protected _f: FrameState = DynamicObject.FRAME
	protected _b: ButtonEvents = DynamicObject.BUTTON

}