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
		
		/*if (input.forward || input.reverse)
		{
			let accel = this.getForwardVector().scale(input.forward ? 1 : input.reverse ? -1 : 0).add(this.getSidewaysVector().scale(-this.turningFactor)).normalize()
			
			let leftAccel  = accel.scale(1 - Math.max( this.turningFactor, 0)).scale(0.05)
			let rightAccel = accel.scale(1 - Math.max(-this.turningFactor, 0)).scale(0.05)
			
			this.bodies[0].speed = this.bodies[0].speed.add(leftAccel)
			this.bodies[1].speed = this.bodies[1].speed.add(rightAccel)
			//this.bodies[2].speed = this.bodies[2].speed.add(rightAccel)
			//this.bodies[3].speed = this.bodies[3].speed.add(leftAccel)
			//this.bodies[4].speed = this.bodies[4].speed.add(leftAccel.add(rightAccel).scale(1 / 2))
		}*/
		
		if (input.turnLeft)
			this.turningFactor = Math.max(this.turningFactor - 0.1, -1)
		else if (input.turnRight)
			this.turningFactor = Math.min(this.turningFactor + 0.1,  1)
		else
		{
			if (this.turningFactor > 0)
				this.turningFactor = Math.max(this.turningFactor - 0.15, 0)
			else
				this.turningFactor = Math.min(this.turningFactor + 0.15, 0)
		}
		
		if (input.reverse)
			this.accelFactor = Math.max(this.accelFactor - 0.1, -1)
		else if (input.forward)
			this.accelFactor = Math.min(this.accelFactor + 0.1,  1)
		else
		{
			if (this.accelFactor > 0)
				this.accelFactor = Math.max(this.accelFactor - 0.15, 0)
			else
				this.accelFactor = Math.min(this.accelFactor + 0.15, 0)
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
		
		for (let body of this.bodies)
		{
			let isFrontWheel = (body == this.bodies[0] || body == this.bodies[1])
			let turningMatrix = Mat4.rotation(new Vec3(0, 0, -1), (isFrontWheel ? this.turningFactor : 0))
			
			body.rollDirection = turningMatrix.mulDirection(this.getForwardVector().projectOnPlane(new Vec3(0, 0, 1)).normalize())
			body.rollSpeed = this.accelFactor
			
			body.processFrame()
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
		return this.bodies[4].pos.sub(this.getCenter()).normalize()
	}
}