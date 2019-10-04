import { Vec, Rect, Collection } from '../primitives'

export interface Sprite {
	img: HTMLImageElement
	region: Rect
}

export class SpriteSheet {

	private sprites: Collection<Sprite> = {}

	constructor(public img: HTMLImageElement) {}

	dice(rows: number, cols: number) {
		this.sprites = {}
		const spriteSize = new Vec(this.img.width / cols, this.img.height / rows)
		for(let y = 0, i = 0; y < rows; y++) {
			for(let x = 0; x < cols; x++, i++) {
				this.sprites[i] = {
					img: this.img,
					region: new Rect(x * spriteSize.x, y * spriteSize.y, spriteSize.x, spriteSize.y)
				}
			}
		}
		return this
	}

	sprite(index: number | string) {
		return this.sprites[index]
	}

}