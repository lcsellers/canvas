import { Collection } from 'lib/util'
import { Vec } from 'lib/primitives'
import { Buttons, Bindings, mousePos } from 'lib/input'
import { Draw2D, ScaleType, Color, colors, GraphicsObject, Text } from 'lib/graphics'
import { DynamicObject } from './DynamicObject'
import { EngineObject } from './EngineObject'
import { CanvasEngine, Timing, FrameState, ButtonEvents, Debugger } from './CanvasEngine'

interface GameStateFeatures {
	draw: Draw2D
	buttons: ButtonEvents
	images: Collection<HTMLImageElement>
}

type FrameCallback = (frame: FrameState) => void
export type GameState = (features: GameStateFeatures, engine: CanvasEngine, ...args: any[]) => FrameCallback | undefined

export interface EngineState {
	draw: Draw2D
	frameTime: number
	fps: number
	images: Collection<HTMLImageElement>
	mouse: Vec
	buttons: Buttons
}

export class Engine extends CanvasEngine {

	images: Collection<HTMLImageElement> = {}

	private buttons = new Buttons()
	
	/** Used upon construction if a canvas element already exists */
	private canvasId: string
	
	/** Debugging */
	private internalDebug = {
		fps: false
	}
	private userDebug: string[] = []
	private debugText: Text | null = null

	/** List of images to load before frame is attached */
	private preloadAssets: string[] = []
	/** Size and scale type to initialize Draw2D with */
	private drawSize?: Vec
	private drawScale?: ScaleType

	/** Color to use for letterboxes in 'fit' mode */
	private clearColor = 'white'

	/** Prevent start() being called multiple times */
	private initSemaphore = false

	private fps = 0
	/** Timestamp of the previous frame to calculate frameTime */
	private lastFrameTime = 0
	/** Ms elapsedTime must reach before the user frame is executed (throttles FPS) */
	private fpsThrottleTime = 0
	/** Accumulates ms since the last frame */
	private elapsedTime = 0
	/** Accumulates ms until it reaches 1000 to calculate FPS */
	private fpsElapsedTime = 0
	/** Accumulates frames executed in 1000 ms chunks */
	private frameCount = 0

	/** Timing */
	private timerId = 0
	private throttleTimers: any = {}
	private delayTimers: any = {}

	/** Game States */
	private userFrame: FrameCallback = () => {}
	private gameStates: Collection<GameState> = {}

	/** animationFrame and Pausing */
	private animationId = 0
	private _paused = false
	get paused() {
		return this._paused
	}

	/** Proxies */
	private timing: Timing = {
		throttle: (fn, ms) => this.throttle(fn, ms),
		delay: (fn, ms) => this.delay(fn, ms)
	}
	private frameState: FrameState = {
		btn: (binding: string) => this.buttons.state(binding),
		frameTime: 0,
		mouse: new Vec()
	}
	private buttonEvents: ButtonEvents = {
		on: (event, fn) => this.$on('btn:' + event, fn),
		off: (event, fn) =>  this.$off('btn:' + event, fn)
	}
	private features: GameStateFeatures | null = null

	constructor(canvasId?: string) {
		super()
		this.canvasId = canvasId || ''
		this.buttons.$proxy(this, 'btn:')
	}

	/**
	 * SETUP
	 */

	setDimensions(dim?: Vec, scale?: ScaleType) {
		this.drawSize = dim
		this.drawScale = scale
		return this
	}

	useMouse(use = true) {
		if(use) {
			document.addEventListener('mousemove', this.onMouseMove)
		} else {
			document.removeEventListener('mousemove', this.onMouseMove)
		}
		return this
	}

	setInternalDebugging(...debuggers: Debugger[]) {
		debuggers.forEach(d => {
			this.internalDebug[d] = !this.internalDebug[d]
		})
		return this
	}

	setBindings(bindings: Bindings) {
		this.buttons.bind(bindings)
		return this
	}

	setClear(color: string) {
		this.clearColor = color
		return this
	}

	setFps(targetFps: number) {
		if(targetFps < 1 || targetFps > 60) throw new Error('FPS must be between 1 and 60')
		this.fpsThrottleTime = 1000 / targetFps
		return this
	}

	preload(...images: string[]) {
		this.preloadAssets = images
		return this
	}

	createGameState(name: string, factory: GameState) {
		this.gameStates[name] = factory
		return this
	}

	/**
	 * Text Defaults
	 */
	setDefaultFont(font: string) {
		Text.D_FAMILY = font
		return this
	}
	setDefaultTextSize(size: number) {
		Text.D_SIZE = size
		return this
	}
	setDefaultTextWeight(weight: string) {
		Text.D_BOLD = weight
		return this
	}
	setDefaultTextStyle(style: string) {
		Text.D_ITALIC = style
		return this
	}
	setDefaultTextColor(fg: Color, bg?: Color) {
		Text.D_FG = fg
		if(bg) {
			Text.D_BG = bg
		}
		return this
	}
	setDefaultTextBackground(bg: Color) {
		Text.D_BG = bg
		return this
	}

	/**
	 * During Execution
	 */

	pause(paused: boolean = true) {
		if(this._paused === paused) return this
		if(this._paused) {
			this.lastFrameTime = performance.now()
			this.animationId = requestAnimationFrame(() => this.frame())
		} else if(this.animationId) {
			cancelAnimationFrame(this.animationId)
		}
		this._paused = paused
		return this
	}

	state(name: string, ...args: any[]) {
		if(!this.features) {
			throw new Error('Cannot switch state before initialized')
		}
		if(!this.gameStates[name]) {
			throw new Error(`Please create game state ${name} before using it`)
		}
		this.buttons.$reset()
		this.$reset()
		this.throttleTimers = {}
		this.delayTimers = {}
		const frame = this.gameStates[name](this.features, this, ...args)
		if(frame) {
			this.userFrame = frame
		} else {
			this.userFrame = () => {}
			this.pause()
		}
	}

	async loadImages(...images: string[]): Promise<Collection<HTMLImageElement>> {
		if(!this.state) {
			throw new Error('Do not call loadImages() before initialization. Use preload() instead.')
		}
		await Promise.all(images.map(src => new Promise((resolve, reject) => {
			const img = document.createElement('img')
			img.onload = () => {
				this.images[src] = img
				resolve()
			}
			img.onerror = err => reject(err)
			img.src = src
		})))
		return this.images
	}

	debug(key: string, value: any) {
		this.userDebug.push(key + ': ' + value)
		return this
	}

	/**
	 * Timing
	 */

	throttle(fn: Function, ms: number) {
		const id = this.timerId++
		this.throttleTimers[id] = ms
		
		const throttled = (...args: any[]) => {
			if(this.throttleTimers[id] < ms) return
			this.throttleTimers[id] = 0
			fn(...args)
		}

		throttled.reset = () => this.throttleTimers[id] = ms
		throttled.changeSpeed = (newMs: number) => ms = newMs

		return throttled
	}

	delay(fn: Function, ms: number) {
		const id = this.timerId++
		this.delayTimers[id] = { timer: ms, fn }
		return () => delete this.delayTimers[id]
	}

	/**
	 * Initialize
	 */

	start(gameState: string = 'main', ...args: any[]) {
		if(this.initSemaphore) {
			throw new Error('Please do not call start() more than once.')
		}
		this.initSemaphore = true
		
		window.addEventListener('load', async () => {
			
			// access dom canvas element
			let canvas
			if(this.canvasId) {
				canvas = document.getElementById(this.canvasId)
			}
			if(!canvas) {
				canvas = document.createElement('canvas')
				document.body.append(canvas)
			}

			// initialize Draw2D
			this.features = {
				draw: new Draw2D(canvas as HTMLCanvasElement, this.drawSize, this.drawScale),
				images: this.images,
				buttons: this.buttonEvents
			}

			// set up Object state
			GraphicsObject.DRAW = this.features.draw
			DynamicObject.BUTTON = this.buttonEvents
			DynamicObject.DEBUG = (key, val) => this.debug(key, val)
			DynamicObject.FRAME = this.frameState
			DynamicObject.TIMING = this.timing
			EngineObject.ENGINE = this

			this.debugText = new Text('')
				.color(colors.white(), colors.black())
				.padding(10)

			if(this.preloadAssets.length) {
				await this.loadImages(...this.preloadAssets)
			}

			this.state(gameState, ...args)

			if(!this._paused) {
				this.lastFrameTime = performance.now()
				requestAnimationFrame(() => this.frame())
			}

		})
		return this
	}

	private onMouseMove(e: MouseEvent) {
		if(!this.features) return
		this.frameState.mouse.copy(mousePos(this.features.draw.canvas, e)
			.scale(this.features.draw.scale)
			.add(this.features.draw.origin))
		this.$emit('btn:mousemove', this.frameState.mouse)
	}

	private frame() {
		this.animationId = 0
		const now = performance.now()
		const frameTime = now - this.lastFrameTime
		this.lastFrameTime = now
		this.elapsedTime += frameTime

		Object.keys(this.throttleTimers).forEach(id => this.throttleTimers[id] += frameTime )
		Object.keys(this.delayTimers).forEach(id => {
			this.delayTimers[id].timer -= frameTime
			if(this.delayTimers[id].timer <= 0) {
				this.delayTimers[id].fn()
				delete this.delayTimers[id]
			}
		})

		if(!this.fpsThrottleTime || this.elapsedTime >= this.fpsThrottleTime) {
			this.frameState.frameTime = this.elapsedTime
			// call user frame
			this.userFrame(this.frameState)
			// draw letterboxes if necessary to mask user content in fit mode
			this.features!.draw.letterbox(this.clearColor)
			// calculate fps
			this.fpsElapsedTime += this.elapsedTime
			this.elapsedTime = 0
			if(this.fpsElapsedTime >= 1000) {
				this.fps = this.frameCount
				this.frameCount = 0
				this.fpsElapsedTime = 0
			}
			this.frameCount++
			// debugging
			if(this.internalDebug.fps) {
				this.userDebug.unshift('FPS: ' + this.fps.toFixed(0))
			}
			if(this.userDebug.length) {
				const debugPos = new Vec(0, 0)
				this.userDebug.forEach(d => {
					this.debugText!.text = d
					this.debugText!.render(debugPos)
					debugPos.y += this.debugText!.renderedSize.y
				})
			}
			this.userDebug = []
			// reset accumulator
			this.frameState.frameTime = 0
		}

		if(!this._paused) {
			this.animationId = requestAnimationFrame(() => this.frame())
		}
	}

}