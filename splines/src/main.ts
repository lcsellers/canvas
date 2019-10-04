import { Engine, PixelBuffer } from 'lib/engine'
import { Key } from 'lib/input'
import { Vec, Spline } from 'lib/primitives'
import { colors } from 'lib/color'

const MOVE_SPEED = 2
const ACTOR_SPEED = 0.5
const ACTOR_RADIUS = 4

new Engine('main')
	.setDimensions(new Vec(200, 150), 'fit')
	.createGameState('main', ({ draw, buttons }, engine) => {

		buttons.bind({
			[Key.KEY_A]: 'prev',
			[Key.KEY_D]: 'next',
			[Key.UP_ARROW]: 'up',
			[Key.DOWN_ARROW]: 'down',
			[Key.LEFT_ARROW]: 'left',
			[Key.RIGHT_ARROW]: 'right',
			[Key.DOWN_ARROW]: 'down'
		})

		const px = new PixelBuffer(draw, draw.size)

		const y = draw.size.y/2
		const col = draw.size.x / 7

		const points: Vec[] = []
		for(let i = 0; i < 6; i++) {
			points.push(new Vec(col + i * col, y))
		}

		const s = new Spline(points, true)
		let actor = 0

		let selected = 0
		buttons.on('prev:down', () => {
			selected--
			if(selected < 0) selected = s.points.length - 1
		})
		buttons.on('next:down', () => {
			selected++
			if(selected >= s.points.length) selected = 0
		})

		return ({ frameTime }) => {

			if(buttons.state('up')) s.points[selected].y -= MOVE_SPEED
			if(buttons.state('right')) s.points[selected].x += MOVE_SPEED
			if(buttons.state('down')) s.points[selected].y += MOVE_SPEED
			if(buttons.state('left')) s.points[selected].x -= MOVE_SPEED

			actor += ACTOR_SPEED / frameTime
			if(actor >= s.points.length) actor -= s.points.length

			px.clear(colors.black())
			px.drawSpline(s, colors.white())
			px.render()

			s.points.forEach((p, i) => {
				draw.circle(p, MOVE_SPEED, i === selected ? 'blue' : 'white')
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