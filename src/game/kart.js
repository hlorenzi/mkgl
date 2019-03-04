class Kart
{
	constructor(director)
	{
		this.director = director
		
		this.size = 1.5
		
		this.bodies =
		[
			new Wheel(this.director, new Vec3(0, 0, 0), [1, 0, 0, 1]),
			new Wheel(this.director, new Vec3(0, 0, 0), [1, 0, 0, 1]),
			new Wheel(this.director, new Vec3(0, 0, 0), [1, 0, 0, 1]),
			new Wheel(this.director, new Vec3(0, 0, 0), [1, 0, 0, 1]),
		]
		
		this.reset()
		
		let builder = new ModelBuilder()
		builder.addCube(
			-this.size * 4 / 3 / 2, -this.size * 3 / 3 / 2, -this.size * 1 / 3 / 2,
			+this.size * 4 / 3 / 2, +this.size * 3 / 3 / 2, +this.size * 1 / 3 / 2)
			
		builder.calculateNormals()
		
		this.model = builder.makeModel(gl)
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material).setDiffuseColor([0, 0, 1, 1])
		
		this.prevPosition = new Vec3(0, 0, 0)
	}
	
	
	reset()
	{
		let pos = new Vec3(-10, 0, -5)//-10 + Math.random() * 20, -10 + Math.random() * 20, -25 + Math.random() * 20)
	
		this.bodies[0].pos = pos.add(new Vec3(1.0, 0.0, -10.0))
		this.bodies[1].pos = pos.add(new Vec3(1.0, 1.0, -10.0))
		this.bodies[2].pos = pos.add(new Vec3(0.0, 1.0, -10.0))
		this.bodies[3].pos = pos.add(new Vec3(0.0, 0.0, -10.0))
		
		this.bodies[0].speed = new Vec3(0, 0, 0)
		this.bodies[1].speed = new Vec3(0, 0, 0)
		this.bodies[2].speed = new Vec3(0, 0, 0)
		this.bodies[3].speed = new Vec3(0, 0, 0)
		
		this.bodies[0].speedMove = new Vec3(0, 0, 0)
		this.bodies[1].speedMove = new Vec3(0, 0, 0)
		this.bodies[2].speedMove = new Vec3(0, 0, 0)
		this.bodies[3].speedMove = new Vec3(0, 0, 0)
		
		this.joints =
		[
			// Bottom Edges
			{ body1: this.bodies[0], body2: this.bodies[1], length: this.size * 3 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[2], body2: this.bodies[3], length: this.size * 3 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[0], body2: this.bodies[3], length: this.size * 4 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[2], length: this.size * 4 / 3, tensionK: 0.1, frictionK: 0.1 },
			
			// Crossing
			{ body1: this.bodies[0], body2: this.bodies[2], length: this.size * 5 / 3, tensionK: 0.25, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[3], length: this.size * 5 / 3, tensionK: 0.25, frictionK: 0.1 },
		]
		
		this.turningFactor = 0
		this.accelFactor = 0
	}
	
	
	processFrame()
	{
		this.processPhysics()		
		this.positionModel()
	}
	
	
	processPhysics()
	{
		if (input.reset)
			this.reset()
		
		if (input.turnLeft)
			this.turningFactor = Math.max(this.turningFactor - 0.05, -1)
		else if (input.turnRight)
			this.turningFactor = Math.min(this.turningFactor + 0.05,  1)
		else
		{
			if (this.turningFactor > 0)
				this.turningFactor = Math.max(this.turningFactor - 0.05, 0)
			else
				this.turningFactor = Math.min(this.turningFactor + 0.05, 0)
		}
		
		/*if (input.reverse)
			this.accelFactor = -1
		else if (input.forward)
			this.accelFactor = 1
		else
			this.accelFactor = 0*/
		
		if (input.reverse)
			this.accelFactor = Math.max(this.accelFactor - 0.01, -1)
		else if (input.forward)
			this.accelFactor = Math.min(this.accelFactor + 0.01,  1)
		else
		{
			if (this.accelFactor > 0)
				this.accelFactor = Math.max(this.accelFactor - 0.015, 0)
			else
				this.accelFactor = Math.min(this.accelFactor + 0.015, 0)
		}
		
		if (input.forward || input.reverse)
		{
			const direction = Mat4.rotation(new Vec3(0, 0, -1), this.turningFactor * 3).mulDirection(this.getForwardVector())
			
			const accel = direction.scale(input.forward ? 0.01 : input.reverse ? -0.01 : 0)//.add(this.getSidewaysVector().scale(-this.turningFactor)).normalize()
			
			//this.bodies[0].accelerate(accel)
			//this.bodies[1].accelerate(accel)
			//this.bodies[0].speed = this.bodies[0].speed.add(accel)
			//this.bodies[1].speed = this.bodies[1].speed.add(accel)
			//this.bodies[2].speed = this.bodies[2].speed.add(accel)
			//this.bodies[3].speed = this.bodies[3].speed.add(accel)
			//this.bodies[2].speed = this.bodies[2].speed.add(rightAccel)
			//this.bodies[3].speed = this.bodies[3].speed.add(leftAccel)
			//this.bodies[4].speed = this.bodies[4].speed.add(leftAccel.add(rightAccel).scale(1 / 2))
		}
		
		for (let joint of this.joints)
		{
			let dir  = joint.body1.pos.sub(joint.body2.pos)
			let dirN = dir.normalize()
			let dist = dir.magn()
			
			let tensionForce = dirN.scale((dist - joint.length) * joint.tensionK)
			
			joint.body1.speed = joint.body1.speed.sub(tensionForce)
			joint.body2.speed = joint.body2.speed.add(tensionForce)
			
			let frictionForce = joint.body1.speed.sub(joint.body2.speed).scale(joint.frictionK)
			
			joint.body1.speed = joint.body1.speed.sub(frictionForce)
			joint.body2.speed = joint.body2.speed.add(frictionForce)
		}
		
		const position = this.getCenter()
		const speed = position.sub(this.prevPosition)
		
		const basisRotation = this.getBasisRotation()
		const up = this.getUpVector()
		
		const wheelSpeedForward = this.getForwardVector().scale(this.accelFactor * (1 - Math.abs(this.turningFactor) * 0.25))
		const turningMatrix = Mat4.rotation(new Vec3(0, 0, -1), 0.15 * this.turningFactor)
		const wheelSpeed = turningMatrix.mulDirection(wheelSpeedForward)
		
		for (let body of this.bodies)
		{
			let isFrontWheel = (body == this.bodies[0] || body == this.bodies[1])
			let turningMatrix = Mat4.rotation(new Vec3(0, 0, 1), (isFrontWheel ? 0.15 * this.turningFactor : 0))
			
			body.speedMove = (isFrontWheel ? wheelSpeed : wheelSpeedForward)
			
			body.orientation = turningMatrix.mul(basisRotation)
			body.rollDirection = turningMatrix.mulDirection(this.getForwardVector().projectOnPlane(new Vec3(0, 0, 1)).normalize())
			body.rollSpeed = -this.accelFactor * 0.5
			
			body.processFrame()
		}
		
		console.log("{ " +
			this.bodies[0].speed.x.toFixed(3).padStart(8) + ", " +
			this.bodies[0].speed.y.toFixed(3).padStart(8) + ", " +
			this.bodies[0].speed.z.toFixed(3).padStart(8) + " },\n{ " +
			this.bodies[0].speedMove.x.toFixed(3).padStart(8) + ", " +
			this.bodies[0].speedMove.y.toFixed(3).padStart(8) + ", " +
			this.bodies[0].speedMove.z.toFixed(3).padStart(8) + " }")
		
		this.prevPosition = position
		this.wrapAround()
	}
	
	
	wrapAround()
	{
		let offsetX = 0
		let offsetY = 0
		
		const worldSize = 50
		const center = this.getCenter()
		
		if (center.x > worldSize)
			offsetX = -worldSize * 2
		
		if (center.x < -worldSize)
			offsetX = worldSize * 2
		
		if (center.y > worldSize)
			offsetY = -worldSize * 2
		
		if (center.y < -worldSize)
			offsetY = worldSize * 2
		
		for (let body of this.bodies)
		{
			body.pos = body.pos.add(new Vec3(offsetX, offsetY, 0))
		}
	}
	
	
	positionModel()
	{
		let forward = this.getForwardVector()
		let sideways = this.getSidewaysVector()
		
		let matrix = Mat4.basisRotation(
			new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1),
			forward, sideways, forward.cross(sideways))
			
		matrix = Mat4.translation(0, 0, -1).mul(matrix)
			
		this.transform.setCustom(matrix).setTranslation(this.getCenter())
	}
	
	
	getBasisRotation()
	{
		let forward = this.getForwardVector()
		let sideways = this.getSidewaysVector()
		
		let matrix = Mat4.basisRotation(
			new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1),
			forward, sideways, forward.cross(sideways))
			
		matrix = Mat4.translation(0, 0, -1).mul(matrix)
		return matrix
		
		return Mat4.rotationFromTo(new Vec3(1, 0, 0), forward)
			//Mat4.basisRotation(
			//new Vec3(-1, 0, 0), new Vec3(0, -1, 0), new Vec3(0, 0, 1),
			//forward, sideways, forward.cross(sideways))
	}
	
	
	getCenter()
	{
		return this.bodies[0].pos.add(this.bodies[1].pos).add(this.bodies[2].pos).add(this.bodies[3].pos).scale(1 / 4)
	}
	
	
	getForwardVector()
	{
		let front = this.bodies[0].pos.add(this.bodies[1].pos).scale(1 / 2)
		let rear  = this.bodies[2].pos.add(this.bodies[3].pos).scale(1 / 2)
		
		return front.sub(rear).normalize()
	}
	
	
	getSidewaysVector()
	{
		return this.bodies[1].pos.sub(this.bodies[0].pos).normalize()
	}
	
	
	getUpVector()
	{
		return (this.bodies[1].pos.sub(this.bodies[0].pos)).cross(this.bodies[2].pos.sub(this.bodies[0].pos)).normalize()
	}
}