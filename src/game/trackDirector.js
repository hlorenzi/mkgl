class TrackDirector
{
	constructor()
	{
		this.scene = new GfxScene()
		
		this.material = new GfxMaterial()
			.setProgram(
				GLProgram.makeFromSrc(gl, vertexSrc, fragmentSrc)
				.registerLocations(gl, ["aPosition", "aNormal"], ["uMatProj", "uMatView", "uMatModel"]))
				
		this.camera = new GfxCamera()
			.setProjection(Mat4.perspective(30 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100))
		
		this.track = new Track(this)
		
		this.objects = []
		this.objects.push(this.track)
		this.objects.push(new Kart(this))
		
		this.rot = 0
	}
	
	
	processFrame()
	{
		this.rot += 0.001
		this.camera.setView(Mat4.lookat(new Vec3(15 + Math.cos(this.rot) * 25, 15 + Math.sin(this.rot) * 25, -15), new Vec3(15, 15, 0), new Vec3(0, 0, -1)))
	
		for (let obj of this.objects)
			obj.processFrame()
		
		this.scene.render(gl, this.camera)
	}
}