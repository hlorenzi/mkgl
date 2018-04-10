class Track
{
	constructor(director)
	{
		this.director = director
		
		let trackBuilder = new ModelBuilder()
		let getHeightAt = (x, y) => -2 + Math.cos(Math.sqrt(x * x + y * y)) * 1
		
		let xMin = -15
		let yMin = -15
		let xMax = 15
		let yMax = 15
		let subdiv = 40
		
		for (let j = 0; j < subdiv; j++)
		{
			for (let i = 0; i < subdiv; i++)
			{
				let x1 = xMin + (xMax - xMin) * ( i      / (subdiv - 1))
				let x2 = xMin + (xMax - xMin) * ((i + 1) / (subdiv - 1))
				let y1 = yMin + (yMax - yMin) * ( j      / (subdiv - 1))
				let y2 = yMin + (yMax - yMin) * ((j + 1) / (subdiv - 1))
				
				trackBuilder.addQuad(
					new Vec3(x1, y1, getHeightAt(x1, y1)),
					new Vec3(x2, y1, getHeightAt(x2, y1)),
					new Vec3(x2, y2, getHeightAt(x2, y2)),
					new Vec3(x1, y2, getHeightAt(x1, y2)))
			}
		}
		
		trackBuilder.addCube(-100, -100, 0, 100, 100, 1)
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