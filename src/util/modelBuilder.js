class ModelBuilder
{
	constructor()
	{
		this.positions = []
		this.normals = []
	}
	
	
	addTri(v1, v2, v3)
	{
		this.positions.push(v1)
		this.positions.push(v2)
		this.positions.push(v3)
		
		this.normals.push(new Vec3(0, 0, 0))
		this.normals.push(new Vec3(0, 0, 0))
		this.normals.push(new Vec3(0, 0, 0))
	}
	
	
	addQuad(v1, v2, v3, v4)
	{
		this.addTri(v1, v2, v3)
		this.addTri(v1, v3, v4)
	}
	
	
	addCube(x1, y1, z1, x2, y2, z2)
	{
		let v1Top = new Vec3(x1, y1, z1)
		let v2Top = new Vec3(x2, y1, z1)
		let v3Top = new Vec3(x2, y2, z1)
		let v4Top = new Vec3(x1, y2, z1)
		
		let v1Bot = new Vec3(x1, y1, z2)
		let v2Bot = new Vec3(x2, y1, z2)
		let v3Bot = new Vec3(x2, y2, z2)
		let v4Bot = new Vec3(x1, y2, z2)
		
		this.addQuad(v1Top, v2Top, v3Top, v4Top)
		this.addQuad(v1Bot, v2Bot, v3Bot, v4Bot)
		this.addQuad(v2Top, v1Top, v1Bot, v2Bot)
		this.addQuad(v3Top, v2Top, v2Bot, v3Bot)
		this.addQuad(v4Top, v3Top, v3Bot, v4Bot)
		this.addQuad(v1Top, v4Top, v4Bot, v1Bot)
	}
	
	
	calculateNormals()
	{
		for (let i = 0; i < this.positions.length; i += 3)
		{
			let v1 = this.positions[i + 0]
			let v2 = this.positions[i + 1]
			let v3 = this.positions[i + 2]
			
			let v1to2 = v2.sub(v1)
			let v1to3 = v3.sub(v1)
			
			let normal = v1to2.cross(v1to3).normalize()
			
			this.normals[i + 0] = normal
			this.normals[i + 1] = normal
			this.normals[i + 2] = normal
		}
	}
	
	
	makeBuffers(gl)
	{
		let positions = []
		let normals = []
		
		for (let i = 0; i < this.positions.length; i++)
		{
			positions.push(this.positions[i].x)
			positions.push(this.positions[i].y)
			positions.push(this.positions[i].z)
			
			normals.push(this.normals[i].x)
			normals.push(this.normals[i].y)
			normals.push(this.normals[i].z)
		}
		
		let buffers = { }
		buffers.positions = GLBuffer.makePosition(gl, positions)
		buffers.normals = GLBuffer.makeNormal(gl, normals)
		return buffers
	}
	
	
	makeCollision()
	{
		let col = new CollisionMesh()
		
		for (let i = 0; i < this.positions.length; i += 3)
			col.addTri(this.positions[i + 0], this.positions[i + 1], this.positions[i + 2])
		
		return col
	}
}