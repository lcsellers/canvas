import { EventEmitter, Collection } from 'lib/util'
import { Key } from './Key'

export interface Bindings { [key: number]: string }

export class Buttons extends EventEmitter {
	
	private _state: Collection<boolean> = {}
	private _bindings: Bindings = {}

	private initialized = false

	constructor(bindings?: Bindings) {
		super()
		if(bindings) {
			this.bind(bindings)
		}
	}

	state(btn: string) {
		return !!this._state[btn]
	}

	bind(bindings: Bindings) {
		if(!this.initialized) {
			this.attachListeners()
		}
		this._bindings = { ...bindings }
	}

	private attachListeners() {
		document.addEventListener('keydown', e => this.btnDown(e.keyCode))
		document.addEventListener('keyup', e => this.btnUp(e.keyCode))
		document.addEventListener('mousedown', e => this.btnDown(Key.MOUSE_LEFT))
		document.addEventListener('mouseup', e => this.btnUp(Key.MOUSE_LEFT))
	}

	private btnDown(key: Key) {
		const binding = this._bindings[key]
		if(!binding || this._state[binding]) return

		this._state[binding] = true
		this.$emit(`${binding}:down`)
	}
	private btnUp(key: Key) {
		const binding = this._bindings[key]
		if(!binding) return

		this._state[binding] = false
		this.$emit(`${binding}:up`)
	}

}