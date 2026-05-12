let g_canvas;
let g_gl;
let g_camera;
let g_uniforms = {};
let g_map = [];
let g_texturesLoaded = 0;
let g_keys = {};
let g_lastMouseX = 0;
let g_dragging = false;
let g_startTime = Date.now();
let g_crystalsCollected = 0;
let g_gameWon = false;
let g_frameCount = 0;
let g_lastFpsTime = Date.now();
let g_fps = 0;

const INITIAL_MAP = [[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,2,2,2,0,0,0,0,4],
  [4,0,0,0,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,2,2,2,2,2,2,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,2,2,2,2,2,2,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,2,2,2,2,2,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,2,2,2,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,2,2,2,2,1,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,0,0,0,4],
  [4,0,0,0,0,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]];

const TERRAIN_MAP = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.25,-0.25,-0.25,-0.25,-0.25,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];

const CRYSTALS = [
  { x: 4,  z: 4,  found: false },
  { x: 27, z: 4,  found: false },
  { x: 5,  z: 27, found: false },
  { x: 27, z: 27, found: false },
  { x: 18, z: 16, found: false }
];

function main() {
  g_canvas = document.getElementById('webgl');
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
  g_map = INITIAL_MAP.map(row => row.slice());
  Cube.init(g_gl, g_uniforms.a_Position, g_uniforms.a_UV);

  initTextures();
  setupInputHandlers();
  requestAnimationFrame(tick);
}

function connectVariablesToGLSL() {
  g_uniforms.a_Position = g_gl.getAttribLocation(g_gl.program, 'a_Position');
  g_uniforms.a_UV = g_gl.getAttribLocation(g_gl.program, 'a_UV');
  g_uniforms.u_ModelMatrix = g_gl.getUniformLocation(g_gl.program, 'u_ModelMatrix');
  g_uniforms.u_ViewMatrix = g_gl.getUniformLocation(g_gl.program, 'u_ViewMatrix');
  g_uniforms.u_ProjectionMatrix = g_gl.getUniformLocation(g_gl.program, 'u_ProjectionMatrix');
  g_uniforms.u_BaseColor = g_gl.getUniformLocation(g_gl.program, 'u_BaseColor');
  g_uniforms.u_TexWeight = g_gl.getUniformLocation(g_gl.program, 'u_TexWeight');
  g_uniforms.u_WhichTexture = g_gl.getUniformLocation(g_gl.program, 'u_WhichTexture');

  var samplers = ['u_Sampler0', 'u_Sampler1', 'u_Sampler2', 'u_Sampler3'];
  for (var i = 0; i < samplers.length; i++) {
    g_uniforms[samplers[i]] = g_gl.getUniformLocation(g_gl.program, samplers[i]);
    g_gl.uniform1i(g_uniforms[samplers[i]], i);
  }
}

function initTextures() {
  loadTexture(0, 'assets/wall.png');
  loadTexture(1, 'assets/grass.png');
  loadTexture(2, 'assets/dirt.png');
  loadTexture(3, 'assets/crystal.png');
}

function loadTexture(unit, src) {
  var texture = g_gl.createTexture();
  var image = new Image();
  image.onload = function() {
    g_gl.pixelStorei(g_gl.UNPACK_FLIP_Y_WEBGL, 1);
    g_gl.activeTexture(g_gl.TEXTURE0 + unit);
    g_gl.bindTexture(g_gl.TEXTURE_2D, texture);
    g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_MIN_FILTER, g_gl.NEAREST);
    g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_MAG_FILTER, g_gl.NEAREST);
    g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_WRAP_S, g_gl.REPEAT);
    g_gl.texParameteri(g_gl.TEXTURE_2D, g_gl.TEXTURE_WRAP_T, g_gl.REPEAT);
    g_gl.texImage2D(g_gl.TEXTURE_2D, 0, g_gl.RGBA, g_gl.RGBA, g_gl.UNSIGNED_BYTE, image);
    g_texturesLoaded++;
    updateStatus();
  };
  image.onerror = function() {
    console.log('Texture failed to load: ' + src);
    g_texturesLoaded++;
    updateStatus();
  };
  image.src = src;
}

function setupInputHandlers() {
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
}

function tick() {
  updateCameraFromKeys();
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

  // Keep player inside the map.
  g_camera.eye.elements[0] = Math.max(1.2, Math.min(30.8, g_camera.eye.elements[0]));
  g_camera.eye.elements[2] = Math.max(1.2, Math.min(30.8, g_camera.eye.elements[2]));
  g_camera.at.elements[0] = Math.max(-10, Math.min(42, g_camera.at.elements[0]));
  g_camera.at.elements[2] = Math.max(-10, Math.min(42, g_camera.at.elements[2]));
  g_camera.updateMatrices();
}

function handleBlockEdit(ev) {
  var target = getTargetCell(2.5);
  if (!target) return;

  if (ev.shiftKey) {
    g_map[target.x][target.z] = Math.min(4, g_map[target.x][target.z] + 1);
  } else {
    g_map[target.x][target.z] = Math.max(0, g_map[target.x][target.z] - 1);
  }
}

function getTargetCell(distance) {
  var f = g_camera.forwardVector().mul(distance);
  var x = Math.floor(g_camera.eye.elements[0] + f.elements[0]);
  var z = Math.floor(g_camera.eye.elements[2] + f.elements[2]);
  if (x < 0 || x >= 32 || z < 0 || z >= 32) return null;
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

  if (!g_gameWon && g_crystalsCollected === CRYSTALS.length && distance2D(px, pz, 16, 28) < 2.0) {
    g_gameWon = true;
  }
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
  if (g_texturesLoaded < 4) {
    status.textContent = 'Loading textures: ' + g_texturesLoaded + '/4';
    return;
  }
  var msg = 'Crystals: ' + g_crystalsCollected + '/' + CRYSTALS.length + ' | FPS: ' + g_fps;
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

  g_gl.clear(g_gl.COLOR_BUFFER_BIT | g_gl.DEPTH_BUFFER_BIT);
  g_gl.uniformMatrix4fv(g_uniforms.u_ViewMatrix, false, g_camera.viewMatrix.elements);
  g_gl.uniformMatrix4fv(g_uniforms.u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

  drawSkyBox();
  drawTerrain();
  drawWalls();
  drawCrystals();
  drawFoxFamily();
}

function drawCubeAt(x, y, z, sx, sy, sz, color, textureNum) {
  var cube = new Cube();
  cube.color = color;
  cube.textureNum = textureNum;
  cube.matrix.translate(x, y, z);
  cube.matrix.scale(sx, sy, sz);
  cube.render(g_gl, g_uniforms);
}

function drawSkyBox() {
  drawCubeAt(-484, -484, -484, 1000, 1000, 1000, [0.45, 0.72, 1.0, 1.0], -1);
}

function drawTerrain() {
  for (var x = 0; x < 32; x++) {
    for (var z = 0; z < 32; z++) {
      var h = TERRAIN_MAP[x][z];
      var tex = h > 0 ? 2 : 1;
      drawCubeAt(x, -0.18 + h * 0.15, z, 1, 0.18 + Math.max(0, h) * 0.25, 1, [0.35, 0.75, 0.30, 1], tex);
    }
  }
}

function drawWalls() {
  for (var x = 0; x < 32; x++) {
    for (var z = 0; z < 32; z++) {
      var height = g_map[x][z];
      for (var y = 0; y < height; y++) {
        drawCubeAt(x, y, z, 1, 1, 1, [1, 1, 1, 1], 0);
      }
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

function drawFoxFamily() {
  drawFox(14.2, 0, 27.3, 1.0);
  drawFox(16.0, 0, 27.4, 0.55);
  drawFox(17.2, 0, 27.0, 0.55);
}

function drawFox(x, y, z, s) {
  // body
  drawCubeAt(x, y + 0.35 * s, z, 1.1 * s, 0.55 * s, 0.45 * s, [0.95, 0.38, 0.10, 1], -1);
  // head
  drawCubeAt(x + 0.85 * s, y + 0.55 * s, z + 0.05 * s, 0.45 * s, 0.45 * s, 0.4 * s, [0.95, 0.38, 0.10, 1], -1);
  // snout
  drawCubeAt(x + 1.2 * s, y + 0.48 * s, z + 0.13 * s, 0.25 * s, 0.18 * s, 0.18 * s, [1.0, 0.9, 0.75, 1], -1);
  // ears
  drawCubeAt(x + 0.88 * s, y + 0.98 * s, z + 0.02 * s, 0.16 * s, 0.25 * s, 0.16 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x + 1.12 * s, y + 0.98 * s, z + 0.22 * s, 0.16 * s, 0.25 * s, 0.16 * s, [0.95, 0.38, 0.10, 1], -1);
  // tail
  drawCubeAt(x - 0.55 * s, y + 0.52 * s, z + 0.05 * s, 0.65 * s, 0.22 * s, 0.22 * s, [0.95, 0.38, 0.10, 1], -1);
  drawCubeAt(x - 0.72 * s, y + 0.52 * s, z + 0.06 * s, 0.18 * s, 0.20 * s, 0.20 * s, [1.0, 0.95, 0.82, 1], -1);
  // legs
  drawCubeAt(x + 0.12 * s, y, z + 0.05 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
  drawCubeAt(x + 0.72 * s, y, z + 0.05 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
  drawCubeAt(x + 0.12 * s, y, z + 0.32 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
  drawCubeAt(x + 0.72 * s, y, z + 0.32 * s, 0.18 * s, 0.35 * s, 0.16 * s, [0.2, 0.13, 0.08, 1], -1);
}
