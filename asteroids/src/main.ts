import { Engine, PixelBuffer } from 'lib/engine'
import { Key } from 'lib/input'
import { Vec } from 'lib/primitives'

import Player from './Player'
import Bullet from './Bullet'
import Asteroid from './Asteroid'

new Engine('main')
	.setDimensions(new Vec(320, 180), 'fit')
	.setInternalDebugging('fps')
	.createGameState('main', ({ draw, buttons }, engine) => {

		buttons.bind({
			[Key.UP_ARROW]: 'thrust',
			[Key.LEFT_ARROW]: 'left',
			[Key.RIGHT_ARROW]: 'right',
			[Key.SPACE]: 'fire'
		})

		const px = new PixelBuffer(draw, draw.size)
		px.wrap = true

		let player: Player
		let dead: boolean
		let bullets: Bullet[]
		let asteroids: Asteroid[]
		let newAsteroids: Asteroid[]
		reset()

		buttons.on('fire:down', () => {
			bullets.push(new Bullet(draw.size, player.pos, player.angle))
		})

		return ({ buttons, frameTime }) => {
			px.clear()

			player.input(
				buttons.state('left'),
				buttons.state('right'),
				buttons.state('thrust'),
				frameTime)
			bullets = bullets.filter(b => b.update(frameTime))
			asteroids = [
				...asteroids.filter(a => {
					a.update(frameTime)
					if(a.collide(player.pos)) {
						dead = true
					}
					for(let i = bullets.length-1; i >= 0; i--) {
						if(a.collide(bullets[i].pos)) {
							bullets.splice(i, 1)
							if(a.radius > 4) {
								newAsteroids.push(
									new Asteroid(draw.size, a.pos, a.radius/2),
									new Asteroid(draw.size, a.pos, a.radius/2)
								)
							}
							return false
						}
					}
					return true
				}),
				...newAsteroids
			]
			newAsteroids = []
			if(dead) {
				return reset()
			}

			player.render(px)
			bullets.forEach(b => b.render(px))
			asteroids.forEach(a => a.render(px))
			px.render()
		}

		function reset() {
			player = new Player(draw.size)
			dead = false
			bullets = []
			asteroids = [
				new Asteroid(draw.size, new Vec(draw.size.x/4, draw.size.y/2), 32),
				new Asteroid(draw.size, new Vec(draw.size.x * 0.75, draw.size.y/2), 32)
			]
			newAsteroids = []
		}
	})
	.start()