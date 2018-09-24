class Track
{
	constructor(director, trackBuilder)
	{
		this.director = director
		
		this.model = trackBuilder.makeModel(gl)
		this.collision = trackBuilder.makeCollision()
		
		this.transform = new GfxNodeTransform().attach(this.director.scene.root)
		this.renderer = new GfxNodeRenderer().attach(this.transform).setModel(this.model).setMaterial(this.director.material)
	}
	
	
	destroy()
	{
		this.renderer.detach()
		this.transform.detach()
	}
	
	
	static makeFlat(director)
	{
		let trackBuilder = Track.makeTerrain((x, y) => 0, 61)
		
		for (let i = 0; i < trackBuilder.normals.length; i += 6)
		{
			let n = ((i / 6) % 2 == 0) ? new Vec3(0, 0, 1) : (new Vec3(0.1, 0.1, 1).normalize())
			
			trackBuilder.normals[i + 0] = n
			trackBuilder.normals[i + 1] = n
			trackBuilder.normals[i + 2] = n
			trackBuilder.normals[i + 3] = n
			trackBuilder.normals[i + 4] = n
			trackBuilder.normals[i + 5] = n
		}
		
		return new Track(director, trackBuilder)
	}
	
	
	static makeWavy(director)
	{
		let getHeightAt = (x, y) =>
		{
			let dist = Math.sqrt(x * x + y * y)
			return -20 * Math.cos(dist * 0.35) / (dist + 1)
		}
		
		return new Track(director, Track.makeTerrain(getHeightAt, 60))
	}
	
	
	static makeTerrain(getHeightAt, subdiv)
	{
		let trackBuilder = new ModelBuilder()
		
		let xMin = -60
		let yMin = -60
		let xMax = 60
		let yMax = 60
		
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
		
		trackBuilder.calculateNormals()
		return trackBuilder
	}
	
	
	processFrame()
	{
		
	}
}