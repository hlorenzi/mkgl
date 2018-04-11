class TrackDirector
{
	constructor()
	{
		this.scene = new GfxScene()
		
		this.material = new GfxMaterial()
			.setProgram(
				GLProgram.makeFromSrc(gl, vertexSrc, fragmentSrc)
				.registerLocations(gl, ["aPosition", "aNormal"], ["uMatProj", "uMatView", "uMatModel", "uDiffuseColor"]))
				
		this.camera = new GfxCamera()
		
		this.track = new Track(this)
		this.kart = new Kart(this)
		
		this.objects = []
		this.objects.push(this.track)
		this.objects.push(this.kart)
		
		this.rot = 0
	}
	
	
	processFrame()
	{
		let kartPos = this.kart.getCenter()
		let kartForward = this.kart.getForwardVector().projectOnPlane(new Vec3(0, 0, -1)).normalize()
		
		this.rot += 0.001
		this.camera
			.setProjection(Mat4.perspective(30 * Math.PI / 180, canvas.width / canvas.height, 1, 400))
			.setView(Mat4.lookat(kartPos.sub(kartForward.scale(15)).add(new Vec3(0, 0, -5)), kartPos, new Vec3(0, 0, -1)))
	
		for (let obj of this.objects)
			obj.processFrame()
		
		this.scene.render(gl, this.camera)
	}
}