let canvas = null
let gl = null
let director = null


function main()
{
	canvas = document.getElementById("canvasMain")
	gl = canvas.getContext("webgl")
	
	onResize()
	
	gl.clearColor(0, 0, 0, 1)
	gl.clearDepth(1.0)
	
	gl.enable(gl.DEPTH_TEST)
	gl.enable(gl.CULL_FACE)
	gl.depthFunc(gl.LEQUAL)

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	
	director = new TrackDirector()
	processFrame()
	
	window.onresize = onResize
}


function onResize()
{
	let bodyRect = document.body.getBoundingClientRect()
	canvas.width = bodyRect.width
	canvas.height = bodyRect.height
	
	gl.viewport(0, 0, canvas.width, canvas.height)
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


function processFrame()
{
	director.processFrame()
	window.requestAnimationFrame(processFrame)
}