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
	attribute vec4 aPosition;

	uniform mat4 uModelView;
	uniform mat4 uProj;

	void main()
	{
		gl_Position = uProj * uModelView * aPosition;
	}`


const fragmentSrc = `
	void main()
	{
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}`

 
let program;
let buffer;


function init()
{
	let canvas = document.getElementById("canvasMain")
	let gl = canvas.getContext("webgl")
	
	gl.clearColor(0, 0, 0, 1)
	gl.clearDepth(1.0)
	
	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LEQUAL)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	program = GLProgram.makeFromSrc(gl, vertexSrc, fragmentSrc)
	program.registerLocations(gl, ["aPosition"], ["uModelView", "uProj"])
	
	buffer = GLBuffer.makePosition(gl, [1, 1, 0,  -1, 1, 0,  1, -1, 0,  -1, -1, 0])
}


let rot = 0
function draw()
{
	let canvas = document.getElementById("canvasMain")
	let gl = canvas.getContext("webgl")
	
	let projection = Mat4.perspective(45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100)
	let modelView = Mat4.rotation(new Vec3(0.5, 1, 0).normalize(), rot).mulMat4(Mat4.translation(0, 0, -6))
	
	rot += 0.1
	
	gl.viewport(0, 0, canvas.width, canvas.height)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	program.use(gl)
	program.bindPosition(gl, "aPosition", buffer)
	program.setMat4(gl, "uModelView", modelView)
	program.setMat4(gl, "uProj", projection)
	program.drawTriangleStrip(gl, 4)
	
	window.requestAnimationFrame(draw)
}