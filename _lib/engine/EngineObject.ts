import { DynamicObject } from './DynamicObject'
import { CanvasEngine } from './CanvasEngine'

export abstract class EngineObject extends DynamicObject {

	static ENGINE: CanvasEngine

	protected _e: CanvasEngine = EngineObject.ENGINE

}