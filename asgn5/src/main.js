import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(10, 7, 14);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.maxDistance = 55;

// Textured skybox.
const skybox = new THREE.CubeTextureLoader()
  .setPath("https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/")
  .load([
    "pos-x.jpg",
    "neg-x.jpg",
    "pos-y.jpg",
    "neg-y.jpg",
    "pos-z.jpg",
    "neg-z.jpg"
  ]);
scene.background = skybox;

// Multiple light sources.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x99ccff, 0x442211, 0.65);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(7, 11, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.left = -18;
directionalLight.shadow.camera.right = 18;
directionalLight.shadow.camera.top = 18;
directionalLight.shadow.camera.bottom = -18;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x7ee7ff, 2.2, 45);
pointLight.position.set(-6, 5, 3);
pointLight.castShadow = true;
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffdd99, 3.2, 40, Math.PI / 7, 0.35, 1.1);
spotLight.position.set(0, 12, 8);
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

function makeCheckerTexture(colorA, colorB, size = 512, squares = 8) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = size;
  canvasTexture.height = size;

  const context = canvasTexture.getContext("2d");
  const squareSize = size / squares;

  for (let y = 0; y < squares; y += 1) {
    for (let x = 0; x < squares; x += 1) {
      context.fillStyle = (x + y) % 2 === 0 ? colorA : colorB;
      context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function makeStripeTexture(colorA, colorB, size = 512) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = size;
  canvasTexture.height = size;

  const context = canvasTexture.getContext("2d");
  context.fillStyle = colorA;
  context.fillRect(0, 0, size, size);

  context.fillStyle = colorB;
  for (let x = 0; x < size; x += 64) {
    context.fillRect(x, 0, 32, size);
  }

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

const grassTexture = makeCheckerTexture("#315c37", "#437a45", 512, 10);
const crateTexture = makeStripeTexture("#73451e", "#a86b2a");

const materials = {
  grass: new THREE.MeshStandardMaterial({ map: grassTexture, roughness: 0.9 }),
  path: new THREE.MeshStandardMaterial({ color: 0x85776b, roughness: 0.95 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x5a341f, roughness: 0.85 }),
  leaves: new THREE.MeshStandardMaterial({ color: 0x2f8f46, roughness: 0.6 }),
  glowingCrystal: new THREE.MeshStandardMaterial({
    color: 0x55ddff,
    emissive: 0x116b88,
    emissiveIntensity: 1.2,
    roughness: 0.25,
    metalness: 0.15
  }),
  purpleCrystal: new THREE.MeshStandardMaterial({
    color: 0xc17dff,
    emissive: 0x411866,
    emissiveIntensity: 1.0,
    roughness: 0.25,
    metalness: 0.1
  }),
  lantern: new THREE.MeshStandardMaterial({
    color: 0xffe59a,
    emissive: 0xffbb44,
    emissiveIntensity: 1.3
  }),
  stone: new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 }),
  crate: new THREE.MeshStandardMaterial({ map: crateTexture, roughness: 0.75 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.55, roughness: 0.25 }),
  water: new THREE.MeshPhysicalMaterial({
    color: 0x3cc7ff,
    transparent: true,
    opacity: 0.52,
    roughness: 0.2,
    metalness: 0.0,
    transmission: 0.15
  })
};

function addMesh(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  scene.add(mesh);
  return mesh;
}

const objectsToAnimate = [];
const crystals = [];

// 1 textured cylinder platform.
const platform = addMesh(
  new THREE.Mesh(new THREE.CylinderGeometry(8, 8.7, 0.7, 64), materials.grass)
);
platform.position.y = -0.35;

// 2 path cylinder.
const path = addMesh(
  new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.08, 64), materials.path)
);
path.position.y = 0.04;

// 3 central water sphere, flattened.
const pond = addMesh(
  new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 16), materials.water),
  true,
  false
);
pond.scale.set(1.25, 0.12, 1.25);
pond.position.y = 0.18;
objectsToAnimate.push({ mesh: pond, type: "pond" });

// 4 to 6 gateway.
const gateLeft = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.3, 0.35), materials.metal));
gateLeft.position.set(-2.25, 1.65, -5.95);

const gateRight = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.3, 0.35), materials.metal));
gateRight.position.set(2.25, 1.65, -5.95);

const gateTop = addMesh(new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.3, 0.35), materials.metal));
gateTop.position.set(0, 3.25, -5.95);

// 16 tree shapes.
for (let i = 0; i < 8; i += 1) {
  const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
  const radius = 6.2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const trunk = addMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.45, 12), materials.trunk)
  );
  trunk.position.set(x, 0.72, z);

  const leaves = addMesh(
    new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.9, 20), materials.leaves)
  );
  leaves.position.set(x, 2.2, z);
}

// Animated floating crystals.
for (let i = 0; i < 7; i += 1) {
  const angle = (i / 7) * Math.PI * 2;
  const crystal = addMesh(
    new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      i % 2 === 0 ? materials.glowingCrystal : materials.purpleCrystal
    )
  );

  crystal.position.set(Math.cos(angle) * 3.8, 2.0 + (i % 3) * 0.35, Math.sin(angle) * 3.8);
  crystals.push(crystal);
  objectsToAnimate.push({ mesh: crystal, type: "crystal", index: i });
}

// Lantern posts and lantern spheres.
for (let i = 0; i < 6; i += 1) {
  const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
  const x = Math.cos(angle) * 4.65;
  const z = Math.sin(angle) * 4.65;

  const post = addMesh(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.7, 10), materials.metal));
  post.position.set(x, 0.85, z);

  const lantern = addMesh(new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 12), materials.lantern));
  lantern.position.set(x, 1.8, z);

  const light = new THREE.PointLight(0xffcc66, 0.55, 5.5);
  light.position.copy(lantern.position);
  scene.add(light);
}

// Textured cubes.
for (let i = 0; i < 4; i += 1) {
  const crate = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), materials.crate));
  crate.position.set(-5.5 + i * 0.75, 0.38, 2.7 + (i % 2) * 0.35);
  crate.rotation.y = i * 0.4;
}

// Rocks.
for (let i = 0; i < 10; i += 1) {
  const angle = (i / 10) * Math.PI * 2 + 0.2;
  const rock = addMesh(new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 10), materials.stone));
  rock.position.set(Math.cos(angle) * 7.25, 0.22, Math.sin(angle) * 7.25);
  rock.scale.set(1 + (i % 3) * 0.35, 0.45, 0.8 + (i % 2) * 0.25);
  rock.rotation.y = i;
}

// Animated crystal ring.
const ring = addMesh(
  new THREE.Mesh(
    new THREE.TorusGeometry(3.75, 0.045, 12, 120),
    new THREE.MeshStandardMaterial({
      color: 0x9ff8ff,
      emissive: 0x44bbff,
      emissiveIntensity: 1.0
    })
  ),
  true,
  false
);
ring.position.y = 1.4;
ring.rotation.x = Math.PI / 2;
objectsToAnimate.push({ mesh: ring, type: "ring" });

// Loaded textured 3D GLTF model.
const loader = new GLTFLoader();
const modelGroup = new THREE.Group();
modelGroup.position.set(0, 0.25, -2.25);
modelGroup.scale.set(1.7, 1.7, 1.7);
scene.add(modelGroup);

loader.load(
  "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
  (gltf) => {
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    model.rotation.y = Math.PI;
    modelGroup.add(model);
  },
  undefined,
  (error) => {
    console.warn("The remote textured 3D model failed to load. Fallback model shown.", error);

    const fallback = addMesh(
      new THREE.Mesh(
        new THREE.DodecahedronGeometry(1, 0),
        new THREE.MeshStandardMaterial({
          color: 0xffaa55,
          metalness: 0.5,
          roughness: 0.35
        })
      )
    );
    fallback.position.copy(modelGroup.position);
  }
);

let showMode = true;

document.querySelector("#show-button").addEventListener("click", () => {
  showMode = !showMode;
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    showMode = !showMode;
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  controls.update();
  modelGroup.rotation.y = elapsed * 0.35;

  objectsToAnimate.forEach((entry) => {
    if (entry.type === "crystal") {
      const orbitSpeed = showMode ? 0.55 : 0.1;
      const angle = elapsed * orbitSpeed + (entry.index / crystals.length) * Math.PI * 2;
      const radius = showMode ? 3.8 : 3.0;

      entry.mesh.position.x = Math.cos(angle) * radius;
      entry.mesh.position.z = Math.sin(angle) * radius;
      entry.mesh.position.y = 2.1 + Math.sin(elapsed * 2.2 + entry.index) * 0.35;
      entry.mesh.rotation.x = elapsed * 1.1 + entry.index;
      entry.mesh.rotation.y = elapsed * 1.45;

      const pulse = 1 + Math.sin(elapsed * 3 + entry.index) * 0.12;
      entry.mesh.scale.setScalar(showMode ? pulse : 0.85);
    }

    if (entry.type === "ring") {
      entry.mesh.visible = showMode;
      entry.mesh.rotation.z = elapsed * 0.75;
      entry.mesh.scale.setScalar(1 + Math.sin(elapsed * 2.0) * 0.04);
    }

    if (entry.type === "pond") {
      entry.mesh.rotation.y = elapsed * 0.08;
      entry.mesh.scale.x = 1.25 + Math.sin(elapsed * 1.4) * 0.03;
      entry.mesh.scale.z = 1.25 + Math.cos(elapsed * 1.3) * 0.03;
    }
  });

  pointLight.position.x = Math.cos(elapsed * 0.55) * 5.8;
  pointLight.position.z = Math.sin(elapsed * 0.55) * 5.8;
  pointLight.position.y = 4 + Math.sin(elapsed * 1.2) * 1.0;

  const targetCrystal = crystals[Math.floor((elapsed * 0.7) % crystals.length)];
  if (targetCrystal) {
    spotLight.target.position.copy(targetCrystal.position);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
