function main()
{
	onResize()
	
	init()
	draw()
	
	window.onresize = onResize
}


function onResize()
{
	let bodyRect = document.body.getBoundingClientRect()
	let canvas = document.getElementById("canvasMain")
	canvas.width = bodyRect.width
	canvas.height = bodyRect.height
}


const vertexSrc = `
	precision highp float;
	
	attribute vec4 aPosition;
	attribute vec4 aNormal;

	uniform mat4 uMatModel;
	uniform mat4 uMatView;
	uniform mat4 uMatProj;
	
	varying vec4 vNormal;

	void main()
	{
		vNormal = uMatModel * vec4(aNormal.xyz, 0);
		
		gl_Position = uMatProj * uMatView * uMatModel * aPosition;
	}`


const fragmentSrc = `
	precision highp float;
	
	varying vec4 vNormal;

	void main()
	{
		vec4 lightDir = vec4(-2.2, 0.2, 1, 0);
		
		vec4 ambientColor = vec4(0.2, 0.2, 0.2, 1);
		vec4 diffuseColor = vec4(1, 1, 1, 1);
		vec4 lightColor = vec4(1, 1, 1, 1);
		
		float lightIncidence = max(0.0, dot(normalize(lightDir), normalize(vNormal)));
		
		gl_FragColor = diffuseColor * mix(ambientColor, lightColor, lightIncidence);
	}`

 
let program;
let terrain;
let terrainCol;
let player;


function init()
{
	let canvas = document.getElementById("canvasMain")
	let gl = canvas.getContext("webgl")
	
	gl.clearColor(0, 0, 0, 1)
	gl.clearDepth(1.0)
	
	gl.enable(gl.DEPTH_TEST)
	gl.enable(gl.CULL_FACE)
	gl.depthFunc(gl.LEQUAL)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	program = GLProgram.makeFromSrc(gl, vertexSrc, fragmentSrc)
	program.registerLocations(gl, ["aPosition", "aNormal"], ["uMatProj", "uMatView", "uMatModel"])
	
	let terrainBuilder = new ModelBuilder()
	let getHeightAt = (x, y) => Math.cos(x * 0.5) * Math.sin(y * 0.7) * 2
	
	for (let y = 0; y < 30; y++)
	{
		for (let x = 0; x < 30; x++)
		{
			terrainBuilder.addQuad(
				new Vec3(x,     y,     getHeightAt(x,     y,   )),
				new Vec3(x + 1, y,     getHeightAt(x + 1, y,   )),
				new Vec3(x + 1, y + 1, getHeightAt(x + 1, y + 1)),
				new Vec3(x,     y + 1, getHeightAt(x,     y + 1)))
		}
	}
	
	terrainBuilder.addCube(10, 10, -2, 16, 16, 1)
	terrainBuilder.calculateNormals()
	terrain = terrainBuilder.makeBuffers(gl)
	terrainCol = terrainBuilder.makeCollision()
	
	let playerBuilder = new ModelBuilder()
	playerBuilder.addCube(-1, -1, -1, 1, 1, 1)
	playerBuilder.calculateNormals()
	player = playerBuilder.makeBuffers(gl)
}


let rot = 0
let pos = 0
function draw()
{
	let canvas = document.getElementById("canvasMain")
	let gl = canvas.getContext("webgl")
	
	let matProjection = Mat4.perspective(30 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100)
	let matView = Mat4.lookat(new Vec3(15 + Math.cos(rot) * 25, 15 + Math.sin(rot) * 25, -15), new Vec3(15, 15, 0), new Vec3(0, 0, -1))
	let matModel = Mat4.identity()
	
	let playerX = (pos * 8 / 30) % 30
	let playerY = pos % 30
	let playerZ = terrainCol.raycast(new Vec3(playerX, playerY, -15), new Vec3(0, 0, 1))
	if (playerZ == null)
		playerZ = { pos: new Vec3(0, 0, 0) }
	
	let matPlayerModel = Mat4.scale(0.1, 0.1, 1).mul(Mat4.translation(playerX, playerY, playerZ.pos.z))
	
	rot += 0.001
	pos += 0.1
	
	gl.viewport(0, 0, canvas.width, canvas.height)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	program.use(gl)
	program.bindPosition(gl, "aPosition", terrain.positions)
	program.bindNormals(gl, "aNormal", terrain.normals)
	program.setMat4(gl, "uMatProj", matProjection)
	program.setMat4(gl, "uMatView", matView)
	program.setMat4(gl, "uMatModel", matModel)
	program.drawTriangles(gl, terrain.positions.count / 3)
	
	program.bindPosition(gl, "aPosition", player.positions)
	program.bindNormals(gl, "aNormal", player.normals)
	program.setMat4(gl, "uMatProj", matProjection)
	program.setMat4(gl, "uMatView", matView)
	program.setMat4(gl, "uMatModel", matPlayerModel)
	program.drawTriangles(gl, player.positions.count / 3)
	
	window.requestAnimationFrame(draw)
}