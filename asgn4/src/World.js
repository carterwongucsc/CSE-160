let g_canvas;
let g_gl;
let g_camera;
let g_uniforms = {};
let g_keys = {};
let g_lastMouseX = 0;
let g_dragging = false;
let g_startTime = Date.now();
let g_frameCount = 0;
let g_lastFpsTime = Date.now();
let g_fps = 0;
let g_objModel = null;

let g_useLighting = true;
let g_showNormals = false;
let g_pointLightOn = true;
let g_spotLightOn = true;
let g_animateLight = true;
let g_lightPos = [16, 5, 16];
let g_lightColor = [1.0, 0.95, 0.82];
let g_spotPos = [16, 7, 27];
let g_spotDir = [0, -0.65, -1.0];

const MAP_SIZE = 32;
const g_map = [];
const CRYSTALS = [
  { x: 4, z: 4, found: false },
  { x: 27, z: 4, found: false },
  { x: 5, z: 27, found: false },
  { x: 27, z: 27, found: false },
  { x: 18, z: 16, found: false }
];
let g_crystalsCollected = 0;
let g_gameWon = false;

const FALLBACK_OBJ = `
v 0 1.6 0
v 0.45 0.6 0.45
v -0.45 0.6 0.45
v -0.45 0.6 -0.45
v 0.45 0.6 -0.45
v 0.45 -0.9 0.45
v -0.45 -0.9 0.45
v -0.45 -0.9 -0.45
v 0.45 -0.9 -0.45
v 0 -1.25 0
vn 0.65 0.40 0.65
vn -0.65 0.40 0.65
vn -0.65 0.40 -0.65
vn 0.65 0.40 -0.65
vn 0 0 1
vn -1 0 0
vn 0 0 -1
vn 1 0 0
vn 0 -1 0
f 1//1 2//1 3//1
f 1//2 3//2 4//2
f 1//3 4//3 5//3
f 1//4 5//4 2//4
f 2//5 6//5 7//5
f 2//5 7//5 3//5
f 3//6 7//6 8//6
f 3//6 8//6 4//6
f 4//7 8//7 9//7
f 4//7 9//7 5//7
f 5//8 9//8 6//8
f 5//8 6//8 2//8
f 6//9 10//9 7//9
f 7//9 10//9 8//9
f 8//9 10//9 9//9
f 9//9 10//9 6//9
`;

function main() {
  g_canvas = document.getElementById('webgl');
  resizeCanvas();
  g_gl = getWebGLContext(g_canvas, false);
  if (!g_gl) {
    alert('Failed to get WebGL context.');
    return;
  }

  if (!initShaders(g_gl, document.getElementById('vshader').text, document.getElementById('fshader').text)) {
    alert('Failed to initialize shaders.');
    return;
  }

  connectVariablesToGLSL();
  g_gl.enable(g_gl.DEPTH_TEST);
  g_gl.clearColor(0.45, 0.72, 1.0, 1.0);

  g_camera = new Camera(g_canvas);
  buildMap();
  Cube.init(g_gl);
  Sphere.init(g_gl, 24);
  initProceduralTextures();
  setupInputHandlers();

  g_objModel = new ObjModel();
  g_objModel.load(g_gl, 'models/lowpoly_rocket.obj', FALLBACK_OBJ);

  window.addEventListener('resize', function() {
    resizeCanvas();
    g_camera.updateMatrices();
  });

  requestAnimationFrame(tick);
}

function resizeCanvas() {
  g_canvas.width = window.innerWidth;
  g_canvas.height = window.innerHeight;
  if (g_gl) g_gl.viewport(0, 0, g_canvas.width, g_canvas.height);
}

function buildMap() {
  for (var x = 0; x < MAP_SIZE; x++) {
    g_map[x] = [];
    for (var z = 0; z < MAP_SIZE; z++) {
      var border = x === 0 || z === 0 || x === MAP_SIZE - 1 || z === MAP_SIZE - 1;
      var maze = (x === 6 && z > 3 && z < 16) || (x === 14 && z > 4 && z < 25) ||
                 (x === 22 && z > 4 && z < 18) || (z === 7 && x > 3 && x < 28) ||
                 (z === 15 && x > 3 && x < 29) || (z === 23 && x > 3 && x < 28);
      var hill = (x > 22 && x < 29 && z > 6 && z < 13) || (x > 4 && x < 13 && z > 19 && z < 29);
      g_map[x][z] = border ? 4 : (maze ? 1 : (hill ? 2 : 0));
    }
  }
}

function connectVariablesToGLSL() {
  g_uniforms.a_Position = g_gl.getAttribLocation(g_gl.program, 'a_Position');
  g_uniforms.a_UV = g_gl.getAttribLocation(g_gl.program, 'a_UV');
  g_uniforms.a_Normal = g_gl.getAttribLocation(g_gl.program, 'a_Normal');
  g_uniforms.u_ModelMatrix = g_gl.getUniformLocation(g_gl.program, 'u_ModelMatrix');
  g_uniforms.u_ViewMatrix = g_gl.getUniformLocation(g_gl.program, 'u_ViewMatrix');
  g_uniforms.u_ProjectionMatrix = g_gl.getUniformLocation(g_gl.program, 'u_ProjectionMatrix');
  g_uniforms.u_NormalMatrix = g_gl.getUniformLocation(g_gl.program, 'u_NormalMatrix');
  g_uniforms.u_BaseColor = g_gl.getUniformLocation(g_gl.program, 'u_BaseColor');
  g_uniforms.u_TexWeight = g_gl.getUniformLocation(g_gl.program, 'u_TexWeight');
  g_uniforms.u_WhichTexture = g_gl.getUniformLocation(g_gl.program, 'u_WhichTexture');
  g_uniforms.u_CameraPos = g_gl.getUniformLocation(g_gl.program, 'u_CameraPos');
  g_uniforms.u_LightPos = g_gl.getUniformLocation(g_gl.program, 'u_LightPos');
  g_uniforms.u_LightColor = g_gl.getUniformLocation(g_gl.program, 'u_LightColor');
  g_uniforms.u_SpotPos = g_gl.getUniformLocation(g_gl.program, 'u_SpotPos');
  g_uniforms.u_SpotDir = g_gl.getUniformLocation(g_gl.program, 'u_SpotDir');
  g_uniforms.u_SpotColor = g_gl.getUniformLocation(g_gl.program, 'u_SpotColor');
  g_uniforms.u_SpotCutoff = g_gl.getUniformLocation(g_gl.program, 'u_SpotCutoff');
  g_uniforms.u_UseLighting = g_gl.getUniformLocation(g_gl.program, 'u_UseLighting');
  g_uniforms.u_ShowNormals = g_gl.getUniformLocation(g_gl.program, 'u_ShowNormals');
  g_uniforms.u_PointLightOn = g_gl.getUniformLocation(g_gl.program, 'u_PointLightOn');
  g_uniforms.u_SpotLightOn = g_gl.getUniformLocation(g_gl.program, 'u_SpotLightOn');

  for (var i = 0; i < 4; i++) {
    var sampler = g_gl.getUniformLocation(g_gl.program, 'u_Sampler' + i);
    g_gl.uniform1i(sampler, i);
  }
}

function setObjectUniforms(gl, uniforms, matrix, color, textureNum) {
  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(matrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(uniforms.u_ModelMatrix, false, matrix.elements);
  gl.uniformMatrix4fv(uniforms.u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform4f(uniforms.u_BaseColor, color[0], color[1], color[2], color[3]);
  gl.uniform1f(uniforms.u_TexWeight, textureNum >= 0 ? 1.0 : 0.0);
  gl.uniform1i(uniforms.u_WhichTexture, Math.max(0, textureNum));
}

function initProceduralTextures() {
  createCheckerTexture(0, [105, 105, 110, 255], [145, 145, 150, 255]);
  createCheckerTexture(1, [60, 145, 55, 255], [75, 170, 70, 255]);
  createCheckerTexture(2, [115, 78, 45, 255], [155, 105, 65, 255]);
  createCheckerTexture(3, [125, 70, 255, 255], [210, 190, 255, 255]);
}

function createCheckerTexture(unit, a, b) {
  var size = 64;
  var pixels = new Uint8Array(size * size * 4);
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      var useA = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
      var c = useA ? a : b;
      var index = (y * size + x) * 4;
      pixels[index] = c[0];
      pixels[index + 1] = c[1];
      pixels[index + 2] = c[2];
      pixels[index + 3] = c[3];
    }
  }
  var texture = g_gl.createTexture();
  g_gl.activeTexture(g_gl.TEXTURE0 + unit);
  g_gl.bindTexture(g_gl.TEXTURE_2D, texture);
  g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_MIN_FILTER, g_gl.NEAREST);
  g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_MAG_FILTER, g_gl.NEAREST);
  g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_WRAP_S, g_gl.REPEAT);
  g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_WRAP_T, g_gl.REPEAT);
  g_gl.texImage2D(g_gl.TEXTURE_2D, 0, g_gl.RGBA, size, size, 0, g_gl.RGBA, g_gl.UNSIGNED_BYTE, pixels);
}

function setupInputHandlers() {
  document.getElementById('lightingButton').onclick = function() { g_useLighting = !g_useLighting; updateButtons(); };
  document.getElementById('normalButton').onclick = function() { g_showNormals = !g_showNormals; updateButtons(); };
  document.getElementById('pointButton').onclick = function() { g_pointLightOn = !g_pointLightOn; updateButtons(); };
  document.getElementById('spotButton').onclick = function() { g_spotLightOn = !g_spotLightOn; updateButtons(); };
  document.getElementById('animateButton').onclick = function() { g_animateLight = !g_animateLight; updateButtons(); };

  ['lightX', 'lightY', 'lightZ', 'lightR', 'lightG', 'lightB'].forEach(function(id) {
    document.getElementById(id).oninput = readLightControls;
  });

  document.onkeydown = function(ev) { g_keys[ev.key.toLowerCase()] = true; };
  document.onkeyup = function(ev) { g_keys[ev.key.toLowerCase()] = false; };

  g_canvas.onmousedown = function(ev) {
    g_dragging = true;
    g_lastMouseX = ev.clientX;
    handleBlockEdit(ev);
  };
  document.onmouseup = function() { g_dragging = false; };
  document.onmousemove = function(ev) {
    if (!g_dragging) return;
    var dx = ev.clientX - g_lastMouseX;
    g_lastMouseX = ev.clientX;
    g_camera.panRight(dx * 0.25);
  };

  updateButtons();
}

function readLightControls() {
  g_lightPos[0] = parseFloat(document.getElementById('lightX').value);
  g_lightPos[1] = parseFloat(document.getElementById('lightY').value);
  g_lightPos[2] = parseFloat(document.getElementById('lightZ').value);
  g_lightColor[0] = parseFloat(document.getElementById('lightR').value);
  g_lightColor[1] = parseFloat(document.getElementById('lightG').value);
  g_lightColor[2] = parseFloat(document.getElementById('lightB').value);
}

function updateButtons() {
  document.getElementById('lightingButton').textContent = 'Lighting: ' + (g_useLighting ? 'On' : 'Off');
  document.getElementById('normalButton').textContent = 'Normals: ' + (g_showNormals ? 'On' : 'Off');
  document.getElementById('pointButton').textContent = 'Point Light: ' + (g_pointLightOn ? 'On' : 'Off');
  document.getElementById('spotButton').textContent = 'Spot Light: ' + (g_spotLightOn ? 'On' : 'Off');
  document.getElementById('animateButton').textContent = 'Animate Light: ' + (g_animateLight ? 'On' : 'Off');
}

function tick() {
  updateCameraFromKeys();
  updateLightAnimation();
  updateGameState();
  renderScene();
  requestAnimationFrame(tick);
}

function updateCameraFromKeys() {
  if (g_keys['w']) g_camera.moveForward();
  if (g_keys['s']) g_camera.moveBackwards();
  if (g_keys['a']) g_camera.moveLeft();
  if (g_keys['d']) g_camera.moveRight();
  if (g_keys['q']) g_camera.panLeft();
  if (g_keys['e']) g_camera.panRight();
  g_camera.eye.elements[0] = Math.max(1.2, Math.min(30.8, g_camera.eye.elements[0]));
  g_camera.eye.elements[2] = Math.max(1.2, Math.min(30.8, g_camera.eye.elements[2]));
  g_camera.updateMatrices();
}

function updateLightAnimation() {
  if (!g_animateLight) {
    readLightControls();
    return;
  }
  var t = (Date.now() - g_startTime) / 1000;
  g_lightPos[0] = 16 + Math.cos(t * 0.75) * 10;
  g_lightPos[1] = 4.5 + Math.sin(t * 1.4) * 1.5;
  g_lightPos[2] = 16 + Math.sin(t * 0.75) * 10;
  document.getElementById('lightX').value = g_lightPos[0];
  document.getElementById('lightY').value = g_lightPos[1];
  document.getElementById('lightZ').value = g_lightPos[2];
  g_lightColor[0] = parseFloat(document.getElementById('lightR').value);
  g_lightColor[1] = parseFloat(document.getElementById('lightG').value);
  g_lightColor[2] = parseFloat(document.getElementById('lightB').value);
}

function handleBlockEdit(ev) {
  var target = getTargetCell(2.5);
  if (!target) return;
  if (ev.shiftKey) g_map[target.x][target.z] = Math.min(4, g_map[target.x][target.z] + 1);
  else g_map[target.x][target.z] = Math.max(0, g_map[target.x][target.z] - 1);
}

function getTargetCell(distance) {
  var f = g_camera.forwardVector().mul(distance);
  var x = Math.floor(g_camera.eye.elements[0] + f.elements[0]);
  var z = Math.floor(g_camera.eye.elements[2] + f.elements[2]);
  if (x < 0 || x >= MAP_SIZE || z < 0 || z >= MAP_SIZE) return null;
  return { x: x, z: z };
}

function updateGameState() {
  var px = g_camera.eye.elements[0];
  var pz = g_camera.eye.elements[2];
  for (var i = 0; i < CRYSTALS.length; i++) {
    var c = CRYSTALS[i];
    if (!c.found && distance2D(px, pz, c.x + 0.5, c.z + 0.5) < 1.2) {
      c.found = true;
      g_crystalsCollected++;
    }
  }
  if (!g_gameWon && g_crystalsCollected === CRYSTALS.length && distance2D(px, pz, 16, 28) < 2.0) g_gameWon = true;
  updateStatus();
}

function distance2D(ax, az, bx, bz) {
  var dx = ax - bx;
  var dz = az - bz;
  return Math.sqrt(dx * dx + dz * dz);
}

function updateStatus() {
  var status = document.getElementById('status');
  if (!status) return;
  var msg = 'Crystals: ' + g_crystalsCollected + '/' + CRYSTALS.length + ' | FPS: ' + g_fps;
  msg += ' | OBJ: ' + (g_objModel && g_objModel.ready ? 'loaded' : 'loading/fallback');
  if (g_gameWon) msg = 'You win! The fox family is safe. | FPS: ' + g_fps;
  status.textContent = msg;
}

function renderScene() {
  g_frameCount++;
  var now = Date.now();
  if (now - g_lastFpsTime > 1000) {
    g_fps = g_frameCount;
    g_frameCount = 0;
    g_lastFpsTime = now;
  }

  g_gl.viewport(0, 0, g_canvas.width, g_canvas.height);
  g_gl.clear(g_gl.COLOR_BUFFER_BIT | g_gl.DEPTH_BUFFER_BIT);
  g_gl.uniformMatrix4fv(g_uniforms.u_ViewMatrix, false, g_camera.viewMatrix.elements);
  g_gl.uniformMatrix4fv(g_uniforms.u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  g_gl.uniform3f(g_uniforms.u_CameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  g_gl.uniform3f(g_uniforms.u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  g_gl.uniform3f(g_uniforms.u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  g_gl.uniform3f(g_uniforms.u_SpotPos, g_spotPos[0], g_spotPos[1], g_spotPos[2]);
  g_gl.uniform3f(g_uniforms.u_SpotDir, g_spotDir[0], g_spotDir[1], g_spotDir[2]);
  g_gl.uniform3f(g_uniforms.u_SpotColor, 0.45, 0.70, 1.0);
  g_gl.uniform1f(g_uniforms.u_SpotCutoff, 0.88);
  g_gl.uniform1i(g_uniforms.u_UseLighting, g_useLighting ? 1 : 0);
  g_gl.uniform1i(g_uniforms.u_ShowNormals, g_showNormals ? 1 : 0);
  g_gl.uniform1i(g_uniforms.u_PointLightOn, g_pointLightOn ? 1 : 0);
  g_gl.uniform1i(g_uniforms.u_SpotLightOn, g_spotLightOn ? 1 : 0);

  drawSkyBox();
  drawTerrain();
  drawWalls();
  drawCrystals();
  drawSpheres();
  drawFoxFamily();
  drawObjModel();
  drawLightMarkers();
}

function drawCubeAt(x, y, z, sx, sy, sz, color, textureNum) {
  var cube = new Cube();
  cube.color = color;
  cube.textureNum = textureNum;
  cube.matrix.translate(x, y, z);
  cube.matrix.scale(sx, sy, sz);
  cube.render(g_gl, g_uniforms);
}

function drawSphereAt(x, y, z, sx, sy, sz, color, textureNum) {
  var sphere = new Sphere();
  sphere.color = color;
  sphere.textureNum = textureNum;
  sphere.matrix.translate(x, y, z);
  sphere.matrix.scale(sx, sy, sz);
  sphere.render(g_gl, g_uniforms);
}

function drawSkyBox() {
  drawCubeAt(-484, -484, -484, 1000, 1000, 1000, [0.45, 0.72, 1.0, 1.0], -1);
}

function drawTerrain() {
  for (var x = 0; x < MAP_SIZE; x++) {
    for (var z = 0; z < MAP_SIZE; z++) {
      var raised = ((x - 26) * (x - 26) + (z - 9) * (z - 9) < 18) || ((x - 8) * (x - 8) + (z - 24) * (z - 24) < 22);
      var h = raised ? 0.35 : 0;
      drawCubeAt(x, -0.18 + h, z, 1, 0.18 + h, 1, [0.35, 0.75, 0.30, 1], raised ? 2 : 1);
    }
  }
}

function drawWalls() {
  for (var x = 0; x < MAP_SIZE; x++) {
    for (var z = 0; z < MAP_SIZE; z++) {
      var height = g_map[x][z];
      for (var y = 0; y < height; y++) drawCubeAt(x, y, z, 1, 1, 1, [1, 1, 1, 1], 0);
    }
  }
}

function drawCrystals() {
  var bob = Math.sin((Date.now() - g_startTime) / 250) * 0.12;
  for (var i = 0; i < CRYSTALS.length; i++) {
    var c = CRYSTALS[i];
    if (c.found) continue;
    drawCubeAt(c.x + 0.25, 0.35 + bob, c.z + 0.25, 0.5, 0.5, 0.5, [0.7, 0.4, 1.0, 1.0], 3);
  }
}

function drawSpheres() {
  drawSphereAt(10, 1.1, 10, 1.1, 1.1, 1.1, [0.95, 0.85, 0.35, 1], -1);
  drawSphereAt(22, 1.0, 19, 1.0, 1.0, 1.0, [0.25, 0.80, 0.95, 1], -1);
  drawSphereAt(14, 2.0, 5, 0.65, 0.65, 0.65, [0.95, 0.35, 0.35, 1], -1);
}

function drawFoxFamily() {
  drawFox(14.2, 0, 27.3, 1.0);
  drawFox(16.0, 0, 27.4, 0.55);
  drawFox(17.2, 0, 27.0, 0.55);
}

function drawFox(x, y, z, s) {
  drawCubeAt(x, y + 0.35 * s, z, 1.1 * s, 0.55 * s, 0.45 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x + 0.85 * s, y + 0.55 * s, z + 0.05 * s, 0.45 * s, 0.45 * s, 0.4 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x + 1.2 * s, y + 0.48 * s, z + 0.13 * s, 0.25 * s, 0.18 * s, 0.18 * s, [1.0, 0.9, 0.75, 1], -1);
  drawCubeAt(x + 0.88 * s, y + 0.98 * s, z + 0.02 * s, 0.16 * s, 0.25 * s, 0.16 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x + 1.12 * s, y + 0.98 * s, z + 0.22 * s, 0.16 * s, 0.25 * s, 0.16 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x - 0.55 * s, y + 0.52 * s, z + 0.05 * s, 0.65 * s, 0.22 * s, 0.22 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x - 0.72 * s, y + 0.52 * s, z + 0.06 * s, 0.18 * s, 0.20 * s, 0.20 * s, [1.0, 0.95, 0.82, 1], -1);
  drawCubeAt(x + 0.12 * s, y, z + 0.05 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
  drawCubeAt(x + 0.72 * s, y, z + 0.05 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
  drawCubeAt(x + 0.12 * s, y, z + 0.32 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
  drawCubeAt(x + 0.72 * s, y, z + 0.32 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
}

function drawObjModel() {
  if (!g_objModel) return;
  g_objModel.matrix = new Matrix4();
  g_objModel.matrix.translate(24, 1.6, 24);
  g_objModel.matrix.rotate((Date.now() - g_startTime) / 40, 0, 1, 0);
  g_objModel.matrix.scale(1.7, 1.7, 1.7);
  g_objModel.color = [0.78, 0.86, 0.95, 1.0];
  g_objModel.render(g_gl, g_uniforms);
}

function drawLightMarkers() {
  drawCubeAt(g_lightPos[0] - 0.15, g_lightPos[1] - 0.15, g_lightPos[2] - 0.15, 0.3, 0.3, 0.3, [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1], -1);
  drawCubeAt(g_spotPos[0] - 0.18, g_spotPos[1] - 0.18, g_spotPos[2] - 0.18, 0.36, 0.36, 0.36, [0.45, 0.70, 1.0, 1], -1);
}
