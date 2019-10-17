import { EventEmitter } from 'lib/util'
import { Draw2D } from './Draw2D'

export abstract class GraphicsObject extends EventEmitter {

	static DRAW: Draw2D | null = null

	protected _d: Draw2D = GraphicsObject.DRAW!

}