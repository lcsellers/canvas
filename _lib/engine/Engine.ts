import { Vec, Collection } from '../primitives'
import { Buttons, Bindings, mousePos } from '../input'
import { Draw2D, ScaleType } from './Draw2D'

type Debugger = 'fps'

export type EngineCallback = (state: EngineState, engine: Engine) => void
export type GameState = (state: EngineState, engine: Engine, ...args: any[]) => EngineCallback

export interface EngineState {
	draw: Draw2D
	frameTime: number
	fps: number
	images: Collection<HTMLImageElement>
	mouse: Vec
	buttons: Buttons
}

export class Engine {

	private state?: EngineState
	private buttons = new Buttons()
	
	/** Used upon construction if a canvas element already exists */
	private canvasId: string
	
	/** Whether to display FPS */
	private debugFps = false

	/** List of images to load before frame is attached */
	private preloadAssets: string[] = []
	/** Size and scale type to initialize Draw2D with */
	private drawSize?: Vec
	private drawScale?: ScaleType

	/** Color to clear the screen each frame before user frame */
	private clearColor = 'white'

	/** Prevent start() being called multiple times */
	private initSemaphore = false

	/** Timestamp of the previous frame to calulate frameTime */
	private lastFrameTime = 0
	/** Ms elapsedTime must reach before the user frame is executed (throttles FPS) */
	private fpsThrottleTime = 0
	/** Accumulates ms since the last frame */
	private elapsedTime = 0
	/** Accumulates ms until it reaches 1000 to calculate FPS */
	private fpsElapsedTime = 0
	/** Accumulates frames executed in 1000 ms chunks */
	private frameCount = 0

	private timerId = 0
	private throttleTimers: any = {}
	private delayTimers: any = {}

	private userFrame: EngineCallback = () => {}
	private gameStates: Collection<GameState> = {}

	private animationId = 0
	private _paused = false
	get paused() {
		return this._paused
	}

	constructor(canvasId?: string) {
		this.canvasId = canvasId || ''
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

	debug(...debuggers: Debugger[]) {
		if(debuggers.includes('fps')) {
			this.debugFps = !this.debugFps
		}
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

	gameState(name: string, ...args: any[]) {
		if(!this.state) {
			throw new Error('Please do not switch game state outside a frame() function')
		}
		if(!this.gameStates[name]) {
			throw new Error(`Please create game state ${name} before using it`)
		}
		this.buttons.removeAllListeners()
		this.throttleTimers = {}
		this.delayTimers = {}
		this.userFrame = this.gameStates[name](this.state, this, ...args)
	}

	async loadImages(...images: string[]): Promise<Collection<HTMLImageElement>> {
		if(!this.state) {
			throw new Error('Do not call loadImages() before initialization. Use preload() instead.')
		}
		await Promise.all(images.map(src => new Promise((resolve, reject) => {
			const img = document.createElement('img')
			img.onload = () => {
				this.state!.images[src] = img
				resolve()
			}
			img.onerror = err => reject(err)
			img.src = src
		})))
		return this.state.images
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
			
			let canvas
			if(this.canvasId) {
				canvas = document.getElementById(this.canvasId)
			}
			if(!canvas) {
				canvas = document.createElement('canvas')
				document.body.append(canvas)
			}

			this.state = {
				draw: new Draw2D(canvas as HTMLCanvasElement, this.drawSize, this.drawScale),
				frameTime: 0,
				fps: 0,
				mouse: new Vec(),
				images: {},
				buttons: this.buttons
			}

			if(this.preloadAssets.length) {
				await this.loadImages(...this.preloadAssets)
			}

			this.gameState(gameState, ...args)

			if(!this._paused) {
				this.lastFrameTime = performance.now()
				requestAnimationFrame(() => this.frame())
			}

		})
		return this
	}

	private clear() {
		const { canvas, ctx } = this.state!.draw
		ctx.save()
		ctx.fillStyle = this.clearColor
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.restore()
	}

	private onMouseMove(e: MouseEvent) {
		if(!this.state) return
		this.state.mouse = mousePos(this.state.draw.canvas, e)
			.mult(this.state.draw.scale)
			.add(this.state.draw.origin)
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
			this.state!.frameTime = this.elapsedTime
			// clear canvas
			this.clear()
			// call user frame
			this.userFrame(this.state!, this)
			// calculate fps
			this.fpsElapsedTime += this.elapsedTime
			this.elapsedTime = 0
			if(this.fpsElapsedTime >= 1000) {
				this.state!.fps = this.frameCount
				this.frameCount = 0
				this.fpsElapsedTime = 0
			}
			this.frameCount++
			// display fps
			if(this.debugFps) {
				const ctx = this.state!.draw.ctx
				ctx.save()
				ctx.fillStyle = 'black'
				ctx.fillRect(0, 0, 45, 18)
				ctx.fillStyle = 'white'
				ctx.textBaseline = 'top'
				ctx.fillText('FPS: ' + this.state!.fps.toFixed(0), 4, 4, )
				ctx.restore()
			}
			this.state!.frameTime = 0
		}

		if(!this._paused) {
			this.animationId = requestAnimationFrame(() => this.frame())
		}
	}

}