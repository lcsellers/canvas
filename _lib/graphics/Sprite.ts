import { Collection } from 'lib/util'
import { Vec, Rect } from 'lib/primitives'
import { Bitmap } from './Bitmap'

export class Sprite {

	img: HTMLImageElement
	origin: Vec
	size: Vec

	get px() {
		if(!this._px) this._px = new Bitmap(this.img)
		return this._px
	}

	private _px: Bitmap | null = null

	constructor(img: HTMLImageElement, origin: Vec = new Vec(), size?: Vec) {
		if(!size) size = new Vec(img.width, img.height)
		this.img = img
		this.origin = origin
		this.size = size
	}

}

export class SpriteSheet {

	private sprites: Collection<Sprite> = {}
	private names: Collection<number> = {}

	constructor(img: HTMLImageElement, size: Vec, names?: string[])
	constructor(img: HTMLImageElement, regions: Rect[], names?: string[])
	constructor(img: HTMLImageElement, cols: number, rows: number, names?: string[])
	constructor() {
		const img: HTMLImageElement = arguments[0]
		let names: string[] = arguments[2]
		let spriteCount = 0
		if(Array.isArray(arguments[1])) {
			const regions: Rect[] = arguments[1]
			regions.forEach((r, i) => {
				this.sprites[i] = new Sprite(img, r.origin, r.size)
				spriteCount++
			})
		} else {
			let size: Vec = arguments[1]
			if(typeof size === 'number') {
				size = new Vec(img.width / arguments[1], img.height / arguments[2])
			}
			for(let y = 0, i = 0; y < img.height; y += size.y) {
				for(let x = 0; x < img.width; x += size.x, i++) {
					this.sprites[i] = new Sprite(img, new Vec(x, y), new Vec(size))
					spriteCount++
				}
			}
		}
		if(names) {
			for(let i = 0; i < spriteCount; i++) {
				this.names[names[i] || i] = i
			}
		} else {
			for(let i = 0; i < spriteCount; i++) {
				this.names[i] = i
			}
		}
	}

	get(index: number | string) {
		return this.sprites[this.names[index]]
	}

}