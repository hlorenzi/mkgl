class Wheel
{
	constructor(director, pos = null, color = null)
	{
		this.director = director
	
		let builder = new ModelBuilder()
		builder.addCylinder(-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 8, new Vec3(0, 1, 0))
		builder.calculateNormals()
		
		this.model = builder.makeModel(gl)
		
		this.pos = (pos != null) ? pos : new Vec3(-15 + Math.random() * 30, -15 + Math.random() * 30, -45 + Math.random() * 40)
		this.speed = new Vec3(0, 0, 0)
		this.rollDirection = new Vec3(1, 0, 0)
		this.rollSpeed = 0
		this.rollAnim = 0
		
		this.color = (color != null) ? color : [1, 0, 0, 1]
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material).setDiffuseColor(this.color)
	}
	
	
	processFrame()
	{
		this.speed = this.speed.add(new Vec3(0, 0, 0.02))
		
		let lastPos = this.pos
		let [newPos, frictionAmount] = this.director.track.collision.solve(this.pos, this.speed, 0.1)
		this.pos = newPos
		this.speed = this.pos.sub(lastPos)
		
		frictionAmount = Math.max(0, Math.min(1, frictionAmount))
		
		const sidewaysFrictionFactor = 0.1
		let sidewaysFrictionAmount = 1 - this.speed.dot(this.rollDirection)
		this.speed = this.speed.add(this.speed.neg().scale(sidewaysFrictionAmount * sidewaysFrictionFactor * frictionAmount))
		
		this.speed = this.speed.add(this.rollDirection.scale(this.rollSpeed).sub(this.speed).scale(frictionAmount))
		
		console.log(frictionAmount, sidewaysFrictionFactor)
		
		this.rollAnim += this.rollSpeed
		
		let matrix = Mat4.rotation(new Vec3(0, 1, 0), this.rollAnim)
			.mul(Mat4.rotationFromTo(new Vec3(1, 0, 0), this.rollDirection))
			.mul(Mat4.scale(0.5, 0.5, 0.5))
			.mul(Mat4.translation(this.pos.x, this.pos.y, this.pos.z - 0.4))
			
		this.transform.setCustom(matrix)
	}
}