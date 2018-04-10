class Kart
{
	constructor(director)
	{
		this.director = director
	
		let playerBuilder = new ModelBuilder()
		playerBuilder.addCube(-1, -1, -1, 1, 1, 1)
		playerBuilder.calculateNormals()
		
		this.model = playerBuilder.makeModel(gl)
		
		this.timer = 0
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material)
	}
	
	
	processFrame()
	{
		this.timer += 0.1
		
		let x = (this.timer * 8 / 30) % 30
		let y = this.timer % 30
		let z = this.director.track.collision.raycast(new Vec3(x, y, -15), new Vec3(0, 0, 1))
		z = (z == null ? 0 : z.pos.z)
		
		this.transform.setTranslation(new Vec3(x, y, z)).setScaling(new Vec3(0.1, 0.1, 1))
	}
}