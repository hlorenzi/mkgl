class Wheel
{
	constructor(director, pos = null, color = null)
	{
		this.director = director
	
		let builder = new ModelBuilder()
		builder.addCylinder(-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 8, new Vec3(0, 1, 0))
		builder.calculateNormals(0)
		
		this.orientation = Mat4.identity()
		
		this.model = builder.makeModel(gl)
		
		this.onGround = false
		
		this.pos = (pos != null) ? pos : new Vec3(-15 + Math.random() * 30, -15 + Math.random() * 30, -45 + Math.random() * 40)
		this.speed = new Vec3(0, 0, 0)
		this.speedMove = new Vec3(0, 0, 0)
		this.rollDirection = new Vec3(1, 0, 0)
		this.rollSpeed = 0
		this.rollAnim = 0
		
		this.color = (color != null) ? color : [1, 0, 0, 1]
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material).setDiffuseColor(this.color)
	}
	
	
	processFrame()
	{
		//const lateralFrictionDirection = this.orientation.mulDirection(new Vec3(0, 1, 0))
		//const lateralFriction = this.speed.project(lateralFrictionDirection).scale(0.5)
		//this.speed = this.speed.sub(lateralFriction)
		//console.log(lateralFrictionDirection.x + ", " + lateralFrictionDirection.y + ", " + lateralFrictionDirection.z)
		
		//const forward = this.orientation.mulDirection(new Vec3(1, 0, 0))
		//console.log(forward)
		
		this.speed = this.speed.add(new Vec3(0, 0, 0.02))
		
		let lastPos = this.pos
		let [newPos, frictionAmount] = this.director.track.collision.solve(this.pos, this.speed, 0.1, 0)
		this.pos = newPos
		this.speed = this.pos.sub(lastPos)
		
		let [newPos2, frictionAmount2] = this.director.track.collision.solve(this.pos, this.speedMove, 0.1, 0)
		this.pos = newPos2
		
		this.onGround = frictionAmount > 0 || frictionAmount2 > 0
		
		this.rollAnim += this.rollSpeed
		
		let matrix = Mat4.rotation(new Vec3(0, 1, 0), this.rollAnim)
			.mul(Mat4.rotationFromTo(new Vec3(1, 0, 0), this.rollDirection))
			.mul(Mat4.scale(0.5, 0.5, 0.5))
			.mul(Mat4.translation(this.pos.x, this.pos.y, this.pos.z - 0.4))
			
		matrix = Mat4.rotation(new Vec3(0, -1, 0), this.rollAnim)
			.mul(this.orientation)
			.mul(Mat4.scale(0.5, 0.5, 0.5))
			.mul(Mat4.translation(this.pos.x, this.pos.y, this.pos.z - 0.4))
			
		this.transform.setCustom(matrix)
	}
	
	
	accelerate(vector)
	{
		this.speed = this.speed.add(vector)
	}
}