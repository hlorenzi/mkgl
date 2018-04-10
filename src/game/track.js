class Track
{
	constructor(director)
	{
		this.director = director
		
		let trackBuilder = new ModelBuilder()
		let getHeightAt = (x, y) => Math.cos(x * 0.5) * Math.sin(y * 0.7) * 2
		
		for (let y = 0; y < 30; y++)
		{
			for (let x = 0; x < 30; x++)
			{
				trackBuilder.addQuad(
					new Vec3(x,     y,     getHeightAt(x,     y,   )),
					new Vec3(x + 1, y,     getHeightAt(x + 1, y,   )),
					new Vec3(x + 1, y + 1, getHeightAt(x + 1, y + 1)),
					new Vec3(x,     y + 1, getHeightAt(x,     y + 1)))
			}
		}
		
		trackBuilder.addCube(10, 10, -2, 16, 16, 1)
		trackBuilder.calculateNormals()
		
		this.model = trackBuilder.makeModel(gl)
		this.collision = trackBuilder.makeCollision()
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material)
	}
	
	
	processFrame()
	{
		
	}
}