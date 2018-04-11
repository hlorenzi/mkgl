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
	
	
	addQuadSubdiv(v1, v2, v3, v4, subdivs)
	{
		for (let j = 0; j < subdivs; j++)
		{
			for (let i = 0; i < subdivs; i++)
			{
				let p1 = v1.lerp(v2, (i + 0) / subdivs)
				let p2 = v1.lerp(v2, (i + 1) / subdivs)
				let p3 = v4.lerp(v3, (i + 1) / subdivs)
				let p4 = v4.lerp(v3, (i + 0) / subdivs)
				
				let f1 = p1.lerp(p4, (j + 0) / subdivs)
				let f2 = p2.lerp(p3, (j + 0) / subdivs)
				let f3 = p2.lerp(p3, (j + 1) / subdivs)
				let f4 = p1.lerp(p4, (j + 1) / subdivs)
				
				this.addQuad(f1, f2, f3, f4)
			}
		}
	}
	
	
	addCube(x1, y1, z1, x2, y2, z2, subdivs = 1)
	{
		let v1Top = new Vec3(x1, y1, z1)
		let v2Top = new Vec3(x2, y1, z1)
		let v3Top = new Vec3(x2, y2, z1)
		let v4Top = new Vec3(x1, y2, z1)
		
		let v1Bot = new Vec3(x1, y1, z2)
		let v2Bot = new Vec3(x2, y1, z2)
		let v3Bot = new Vec3(x2, y2, z2)
		let v4Bot = new Vec3(x1, y2, z2)
		
		this.addQuadSubdiv(v1Top, v2Top, v3Top, v4Top, subdivs)
		this.addQuadSubdiv(v1Bot, v4Bot, v3Bot, v2Bot, subdivs)
		this.addQuadSubdiv(v2Top, v1Top, v1Bot, v2Bot, subdivs)
		this.addQuadSubdiv(v3Top, v2Top, v2Bot, v3Bot, subdivs)
		this.addQuadSubdiv(v4Top, v3Top, v3Bot, v4Bot, subdivs)
		this.addQuadSubdiv(v1Top, v4Top, v4Bot, v1Bot, subdivs)
	}
	
	
	addSphere(x1, y1, z1, x2, y2, z2, subdivs)
	{
		let index = this.positions.length
		
		this.addCube(x1, y1, z1, x2, y2, z2, subdivs)
		
		let c = new Vec3(
			(x1 + x2) / 2,
			(y1 + y2) / 2,
			(z1 + z2) / 2)
			
		let size = new Vec3(			
			Math.abs(x2 - x1) / 2,
			Math.abs(y2 - y1) / 2,
			Math.abs(z2 - z1) / 2)
			
		for (let i = index; i < this.positions.length; i++)
			this.positions[i] = c.add(this.positions[i].sub(c).normalize().mul(size))
	}
	
	
	calculateNormals(maxSmoothAngle = 1.5)
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
		
		let verticesSet = new Map()
		for (let j = 0; j < this.positions.length; j++)
		{
			let key = this.positions[j].asArray().map(x => Math.round(x * 100) / 100).toString()
			
			let value = verticesSet.get(key)
			if (value === undefined)
				verticesSet.set(key, [j])
			else
				value.push(j)
		}
		
		let normalAccum = []
		let normalCount = []
		for (let j = 0; j < this.positions.length; j++)
		{
			normalAccum[j] = this.normals[j]
			normalCount[j] = 1
			
			let vertices = verticesSet.get(this.positions[j].asArray().map(x => Math.round(x * 100) / 100).toString())
			if (vertices === undefined)
				continue
			
			for (let i of vertices)
			{
				if (i == j)
					continue
				
				if (Math.abs(Math.acos(this.normals[j].dot(this.normals[i]))) <= maxSmoothAngle)
				{
					normalAccum[j] = normalAccum[j].add(this.normals[i])
					normalCount[j] += 1
				}
			}
		}
		
		for (let i = 0; i < this.positions.length; i++)
			this.normals[i] = normalAccum[i].scale(1 / normalCount[i]).normalize()
	}
	
	
	makeModel(gl)
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
		
		let model = new GfxModel()
			.setPositions(GLBuffer.makePosition(gl, positions))
			.setNormals(GLBuffer.makeNormal(gl, normals))
		
		return model
	}
	
	
	makeCollision()
	{
		let col = new CollisionMesh()
		
		for (let i = 0; i < this.positions.length; i += 3)
			col.addTri(this.positions[i + 0], this.positions[i + 1], this.positions[i + 2])
		
		return col
	}
}