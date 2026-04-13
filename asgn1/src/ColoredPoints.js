// ColoredPoints.js
// Shader Programs
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global State
let canvas, gl, a_Position, u_FragColor, u_Size;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_selectedSegments = 10;
let g_selectedType = 'square';
let g_shapesList = [];

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas, false);
  if (!gl) { console.log('Failed to get context'); return; }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
}

function addActionsForHtmlUI() {
  // Sliders
  document.getElementById('redSlide').oninput = function() { g_selectedColor[0] = this.value/100; };
  document.getElementById('greenSlide').oninput = function() { g_selectedColor[1] = this.value/100; };
  document.getElementById('blueSlide').oninput = function() { g_selectedColor[2] = this.value/100; };
  document.getElementById('sizeSlide').oninput = function() { g_selectedSize = this.value; };
  document.getElementById('segmentSlide').oninput = function() { g_selectedSegments = this.value; };

  // Buttons
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
  document.getElementById('squarebutton').onclick = function() { g_selectedType = 'square'; };
  document.getElementById('triButton').onclick = function() { g_selectedType = 'triangle'; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = 'circle'; };
  
  document.getElementById('pictureButton').onclick = drawMyPicture;
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for(var i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();
  }
}

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);
  let shape;
  
  if (g_selectedType == 'square') {
    shape = new Square();
  } else if (g_selectedType == 'triangle') {
    shape = new Triangle();
  } else {
    shape = new Circle();
    shape.segments = g_selectedSegments;
  }

  shape.position = [x, y];
  shape.color = g_selectedColor.slice();
  shape.size = g_selectedSize;
  
  g_shapesList.push(shape);
  renderAllShapes();
}

function drawMyPicture() {
  g_shapesList = [];

  addRect(-1.0, 1.0, 1.0, -1.0, [0.05, 0.05, 0.2, 1.0]); 

  let moonColor = [1.0, 0.9, 0.5, 1.0];
  addRect(-0.7, 0.8, -0.4, 0.75, moonColor); 
  addRect(-0.7, 0.55, -0.4, 0.5, moonColor); 
  addRect(-0.7, 0.75, -0.65, 0.55, moonColor); 

  let mtColorMain = [0.5, 0.3, 0.7, 1.0];
  let mtColorDark = [0.3, 0.1, 0.4, 1.0];

  let leftArm = new Triangle();
  leftArm.customCoords = [-0.2, -0.4, 0.1, 0.6, 0.4, -0.4]; 
  leftArm.color = mtColorMain;
  g_shapesList.push(leftArm);

  let rightArm = new Triangle();
  rightArm.customCoords = [0.5, -0.4, 0.8, 0.6, 1.1, -0.4];
  rightArm.color = mtColorMain;
  g_shapesList.push(rightArm);

  let centerV = new Triangle();
  centerV.customCoords = [0.1, -0.4, 0.45, 0.2, 0.8, -0.4];
  centerV.color = mtColorDark;
  g_shapesList.push(centerV);

  let joint = new Triangle();
  joint.customCoords = [0.35, -0.4, 0.45, -0.1, 0.55, -0.4];
  joint.color = [0.8, 0.6, 1.0, 1.0];
  g_shapesList.push(joint);

  for(let i = 0; i < 4; i++) {
    let y = -0.4 - (i * 0.1);
    addRect(-1.0, y, 1.0, y-0.05, [0.0, 0.2 + (i*0.15), 0.4, 1.0]);
  }

  renderAllShapes();
}

function addRect(x1, y1, x2, y2, color) {
  // Triangle 1
  let t1 = new Triangle();
  t1.position = [x1, y1];
  t1.color = color;
  t1.customCoords = [x1, y1, x2, y1, x1, y2];
  g_shapesList.push(t1);

  // Triangle 2
  let t2 = new Triangle();
  t2.position = [x1, y1];
  t2.color = color;
  t2.customCoords = [x2, y1, x2, y2, x1, y2];
  g_shapesList.push(t2);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) click(ev); };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}