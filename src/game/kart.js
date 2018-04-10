class Kart
{
	constructor(director)
	{
		this.director = director
	
		let playerBuilder = new ModelBuilder()
		playerBuilder.addSphere(-1, -1, -1, 1, 1, 1, 5)
		playerBuilder.calculateNormals()
		
		this.model = playerBuilder.makeModel(gl)
		
		this.pos = new Vec3(-15 + Math.random() * 30, -15 + Math.random() * 30, -45 + Math.random() * 40)
		this.speed = new Vec3(0, 0, 0)
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material).setDiffuseColor([1, 0, 0, 1])
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