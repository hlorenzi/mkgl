class Kart
{
	constructor(director)
	{
		this.director = director
		
		let pos = new Vec3(-10 + Math.random() * 20, -10 + Math.random() * 20, -25 + Math.random() * 20)
		let size = 1.5
	
		this.bodies =
		[
			new Sphere(director, pos.add(new Vec3(1.0, 0.0, -10.0)), [1, 0, 0, 1]),
			new Sphere(director, pos.add(new Vec3(1.0, 1.0, -10.0)), [1, 0, 0, 1]),
			new Sphere(director, pos.add(new Vec3(0.0, 1.0, -10.0)), [1, 0, 0, 1]),
			new Sphere(director, pos.add(new Vec3(0.0, 0.0, -10.0)), [1, 0, 0, 1]),
			new Sphere(director, pos.add(new Vec3(0.5, 0.5, -11.5)), [0, 0, 1, 1]),
		]
		
		this.joints =
		[
			// Edges
			{ body1: this.bodies[0], body2: this.bodies[1], length: size * 3 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[2], body2: this.bodies[3], length: size * 3 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[0], body2: this.bodies[3], length: size * 4 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[2], length: size * 4 / 3, tensionK: 0.1, frictionK: 0.1 },
			
			// Crossing
			{ body1: this.bodies[0], body2: this.bodies[2], length: size * 5 / 3, tensionK: 0.1, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[3], length: size * 5 / 3, tensionK: 0.1, frictionK: 0.1 },
			
			// Pyramid
			{ body1: this.bodies[0], body2: this.bodies[4], length: size * 4 / 3, tensionK: 1.0, frictionK: 0.1 },
			{ body1: this.bodies[1], body2: this.bodies[4], length: size * 4 / 3, tensionK: 1.0, frictionK: 0.1 },
			{ body1: this.bodies[2], body2: this.bodies[4], length: size * 4 / 3, tensionK: 1.0, frictionK: 0.1 },
			{ body1: this.bodies[3], body2: this.bodies[4], length: size * 4 / 3, tensionK: 1.0, frictionK: 0.1 },
		]
		
		let builder = new ModelBuilder()
		builder.addCube(
			-size * 4 / 3 / 2, -size * 3 / 3 / 2, -size * 1 / 3 / 2,
			+size * 4 / 3 / 2, +size * 3 / 3 / 2, +size * 1 / 3 / 2)
			
		builder.calculateNormals()
		
		this.model = builder.makeModel(gl)
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material).setDiffuseColor([0, 0, 1, 1])
	}
	
	
	processFrame()
	{
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
			body.processFrame()
		
		let c = this.bodies[0].pos.add(this.bodies[1].pos).add(this.bodies[2].pos).add(this.bodies[3].pos).scale(1 / 4)
		
		let front = this.bodies[0].pos.add(this.bodies[1].pos).scale(1 / 2)
		let rear  = this.bodies[2].pos.add(this.bodies[3].pos).scale(1 / 2)
		
		let yaw = front.sub(rear).normalize()
		let roll = this.bodies[1].pos.sub(this.bodies[0].pos).normalize()
		
		let matrix = Mat4.basisRotation(
			new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1),
			yaw, roll, yaw.cross(roll))
			
		matrix = Mat4.translation(0, 0, -1).mul(matrix)
			
		this.transform.setCustom(matrix).setTranslation(c)
	}
}