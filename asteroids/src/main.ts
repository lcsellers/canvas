import { Engine } from 'lib/engine'
import { Bitmap } from 'lib/graphics'
import { Key } from 'lib/input'
import { Vec } from 'lib/primitives'

import Player from './Player'
import Bullet from './Bullet'
import Asteroid from './Asteroid'

new Engine('main')
	.setDimensions(new Vec(320, 180), 'fit')
	.setInternalDebugging('fps')
	.createGameState('main', ({ draw, buttons }, engine) => {

		engine.setBindings({
			[Key.UP_ARROW]: 'thrust',
			[Key.LEFT_ARROW]: 'left',
			[Key.RIGHT_ARROW]: 'right',
			[Key.SPACE]: 'fire'
		})

		const px = new Bitmap(draw.size)
		px.wrap = true

		let player: Player
		let dead: boolean
		let bullets: Bullet[]
		let asteroids: Asteroid[]
		let newAsteroids: Asteroid[]
		reset()

		buttons.on('fire:down', () => {
			bullets.push(new Bullet(player.pos, player.angle))
		})

		return () => {
			px.clear()

			player.update()
			bullets = bullets.filter(b => b.update())
			asteroids = [
				...asteroids.filter(a => {
					a.update()
					if(a.collide(player.pos)) {
						dead = true
					}
					for(let i = bullets.length-1; i >= 0; i--) {
						if(a.collide(bullets[i].pos)) {
							bullets.splice(i, 1)
							if(a.radius > 4) {
								newAsteroids.push(
									new Asteroid(a.pos, a.radius/2),
									new Asteroid(a.pos, a.radius/2)
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
			draw.bitmap(px)
		}

		function reset() {
			player = new Player()
			dead = false
			bullets = []
			asteroids = [
				new Asteroid(new Vec(draw.size.x/4, draw.size.y/2), 32),
				new Asteroid(new Vec(draw.size.x * 0.75, draw.size.y/2), 32)
			]
			newAsteroids = []
		}
	})
	.start()