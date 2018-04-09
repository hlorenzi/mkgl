class CollisionMesh
{
	constructor()
	{
		this.triangles = []
	}
	
	
	addTri(v1, v2, v3)
	{
		let tri = {}
		tri.v1 = v1,
		tri.v1to2 = v2.sub(v1),
		tri.v1to3 = v3.sub(v1),
		tri.normal = tri.v1to2.cross(tri.v1to3).normalize()
		
		this.triangles.push(tri)
	}
	
	
	raycast(origin, dir)
	{
		let margin = 0.000001;
		
		let nearestHit = null
		
		for (let tri of this.triangles)
		{
			const crossP = dir.cross(tri.v1to2)
			const det = crossP.dot(tri.v1to3)
			
			if (det < margin)
				continue
			
			const v1toOrigin = origin.sub(tri.v1)
			const u = v1toOrigin.dot(crossP)
			
			if (u < 0 || u > det)
				continue
			
			const crossQ = v1toOrigin.cross(tri.v1to3)
			const v = dir.dot(crossQ)
			
			if (v < 0 || u + v > det)
				continue
			
			const dist = Math.abs(tri.v1to2.dot(crossQ) / det)
			
			if (nearestHit == null || dist < nearestHit.dist)
			{
				nearestHit =
				{
					dist: dist,
					pos: origin.add(dir.scale(dist)),
					u: u,
					v: v,
					tri: tri
				}
			}
			
			/*var triangleVec1 = obj.mesh[i].v21;
			var triangleVec2 = obj.mesh[i].v31;
			
			var crossVecP = vec3.cross(rayDirection, triangleVec2, obj.tempVec);
			var det = vec3.dot(crossVecP, triangleVec1);
			
			if (det < margin) continue;
			
			var triangleVec0 = obj.mesh[i].v1;
			var triangleVertToOrigin = vec3.subtract(rayOrigin, triangleVec0, obj.tempVec2);
			var u = vec3.dot(triangleVertToOrigin, crossVecP);
			
			if (u < 0 || u > det) continue;
			
			var crossVecQ = vec3.cross(triangleVertToOrigin, triangleVec1, obj.tempVec3);
			var v = vec3.dot(rayDirection, crossVecQ);
			
			if (v < 0 || u + v > det) continue;
			
			var dist = Math.abs(vec3.dot(triangleVec2, crossVecQ) / det);
			
			if (dist < obj.intersectData.distance) {
				obj.intersectData.hit = 1;
				vec3.set(rayDirection, obj.intersectData.position);
				vec3.scale(obj.intersectData.position, dist);
				vec3.add(obj.intersectData.position, rayOrigin);
				obj.intersectData.distance = dist;
				obj.intersectData.u = u;
				obj.intersectData.v = v;
				obj.intersectData.index = i;
			}*/
		}
		
		return nearestHit
	}
}