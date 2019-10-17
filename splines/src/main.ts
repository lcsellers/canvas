import { Engine } from 'lib/engine'
import { Key } from 'lib/input'
import { Vec, Spline } from 'lib/primitives'
import { colors, Bitmap } from 'lib/graphics'

const MOVE_SPEED = 1
const ACTOR_SPEED = 0.5
const ACTOR_RADIUS = 4

new Engine('main')
	.setDimensions(new Vec(200, 150), 'fit')
	.createGameState('main', ({ draw, buttons }, engine) => {

		engine.setBindings({
			[Key.KEY_A]: 'prev',
			[Key.KEY_D]: 'next',
			[Key.UP_ARROW]: 'up',
			[Key.DOWN_ARROW]: 'down',
			[Key.LEFT_ARROW]: 'left',
			[Key.RIGHT_ARROW]: 'right',
			[Key.DOWN_ARROW]: 'down'
		})

		const px = new Bitmap(draw.size)

		const center = Vec.mult(draw.size, 0.5)
		const r = center.y * 0.7

		const points: Vec[] = []
		const segments = 10
		const segment = Math.PI * 2 / segments
		for(let i = 0; i < segments; i++) {
			const a = segment * i
			points.push(new Vec(Math.sin(a), Math.cos(a)).mult(r).add(center))
		}

		const s = new Spline(points, true)
		let actor = 0

		let selected = 0
		buttons.on('prev:down', () => {
			selected--
			if(selected < 0) selected = points.length - 1
		})
		buttons.on('next:down', () => {
			selected++
			if(selected >= points.length) selected = 0
		})

		return ({ frameTime, btn }) => {

			if(btn('up')) points[selected].y -= MOVE_SPEED
			if(btn('right')) points[selected].x += MOVE_SPEED
			if(btn('down')) points[selected].y += MOVE_SPEED
			if(btn('left')) points[selected].x -= MOVE_SPEED

			actor += ACTOR_SPEED / frameTime
			if(actor >= points.length) actor -= points.length

			px.clear(colors.black())
			px.drawSpline(s, colors.white())
			draw.bitmap(px)

			points.forEach((p, i) => {
				draw.circle(p, MOVE_SPEED*2, i === selected ? 'blue' : 'green')
			})

			const p = s.getCoord(actor)
			const g = s.getAngle(actor)

			const r = Math.atan2(-g.y, g.x)
			draw.line(
				new Vec(ACTOR_RADIUS * Math.sin(r) + p.x, ACTOR_RADIUS * Math.cos(r) + p.y),
				new Vec(-ACTOR_RADIUS * Math.sin(r) + p.x, -ACTOR_RADIUS * Math.cos(r) + p.y),
				'red'
			)
		}
	})
	.start()