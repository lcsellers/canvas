import { Collection } from './Collection'

interface Proxy {
	ee: EventEmitter
	prefix: string
}

export class EventEmitter {

	private $listeners: Collection<Function[]> = {}
	private $proxies: Proxy[] = []

	$on(event: string, fn: Function) {
		if(!this.$listeners[event]) this.$listeners[event] = []
		this.$listeners[event].push(fn)
	}

	$off(event: string, fn: Function) {
		if(!this.$listeners[event]) return
		const i = this.$listeners[event].indexOf(fn)
		if(i !== -1) this.$listeners[event].splice(i, 1)
	}

	$emit(event: string, ...args: any[]) {
		this.$proxies.forEach(p => p.ee.$emit(p.prefix + event, ...args))
		if(!this.$listeners[event]) return
		this.$listeners[event].forEach(listener => listener(...args))
	}

	$proxy(ee: EventEmitter, prefix: string = '') {
		this.$proxies.push({ ee, prefix })
	}

	$reset() {
		this.$listeners = {}
	}

}