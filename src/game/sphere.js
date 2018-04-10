class Sphere
{
	constructor(director, pos = null, color = null)
	{
		this.director = director
	
		let builder = new ModelBuilder()
		builder.addSphere(-1, -1, -1, 1, 1, 1, 4)
		builder.calculateNormals()
		
		this.model = builder.makeModel(gl)
		
		this.pos = (pos != null) ? pos : new Vec3(-15 + Math.random() * 30, -15 + Math.random() * 30, -45 + Math.random() * 40)
		this.speed = new Vec3(0, 0, 0)
		
		this.color = (color != null) ? color : [1, 0, 0, 1]
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material).setDiffuseColor(this.color)
	}
	
	
	processFrame()
	{
		this.speed = this.speed.add(new Vec3(0, 0, 0.01))
		
		let lastPos = this.pos
		this.pos = this.director.track.collision.solve(this.pos, this.speed, 0.1)
		this.speed = this.pos.sub(lastPos)
		
		this.transform.setTranslation(this.pos.add(new Vec3(0, 0, -0.4))).setScaling(new Vec3(0.5, 0.5, 0.5))
	}
}