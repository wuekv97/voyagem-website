import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

// ============================================================
// PROCEDURAL MINECRAFT TEXTURES (16x16 canvas, nearest filter)
// ============================================================

function makeCanvas(fillFn) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  fillFn(ctx);
  return c;
}

function makeTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapLinearFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function noisy(ctx, x0, y0, w, h, r, g, b, range) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const v = (Math.random() - 0.5) * range;
      ctx.fillStyle = `rgb(${clamp(r + v)},${clamp(g + v)},${clamp(b + v)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function scatter(ctx, count, r, g, b, range) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    const v = (Math.random() - 0.5) * range;
    ctx.fillStyle = `rgb(${clamp(r + v)},${clamp(g + v)},${clamp(b + v)})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

// --- Grass block faces ---
const grassTop = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 92, 166, 62, 24);
  scatter(ctx, 26, 110, 190, 70, 18);
  scatter(ctx, 14, 70, 130, 40, 14);
}));
const grassSide = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 4, 92, 166, 62, 22);
  for (let x = 0; x < 16; x++) {
    const grass = Math.random() < 0.55;
    if (grass) {
      const v = (Math.random() - 0.5) * 18;
      ctx.fillStyle = `rgb(${clamp(92 + v)},${clamp(166 + v)},${clamp(62 + v)})`;
    } else {
      const v = (Math.random() - 0.5) * 18;
      ctx.fillStyle = `rgb(${clamp(134 + v)},${clamp(96 + v)},${clamp(67 + v)})`;
    }
    ctx.fillRect(x, 3 + Math.floor(Math.random() * 2), 1, 1);
  }
  noisy(ctx, 0, 5, 16, 11, 134, 96, 67, 26);
  scatter(ctx, 18, 100, 70, 50, 14);
}));
const dirtTex = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 134, 96, 67, 26);
  scatter(ctx, 22, 100, 70, 50, 14);
}));

// --- Diamond ---
const diamondTex = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 108, 220, 224, 16);
  ctx.fillStyle = 'rgb(54, 156, 172)';
  const pattern = [[2, 2], [3, 2], [2, 3], [12, 2], [13, 2], [13, 3], [2, 12], [2, 13], [3, 13], [12, 13], [13, 13], [13, 12], [7, 7], [8, 7], [7, 8], [8, 8]];
  pattern.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  ctx.fillStyle = 'rgb(190, 245, 248)';
  ctx.fillRect(5, 5, 1, 1);
  ctx.fillRect(10, 10, 1, 1);
}));

// --- Gold ---
const goldTex = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 247, 201, 77, 18);
  ctx.fillStyle = 'rgb(200, 148, 20)';
  [[1, 1], [2, 1], [1, 2], [13, 1], [14, 1], [14, 2], [1, 13], [1, 14], [2, 14], [13, 14], [14, 14], [14, 13], [7, 7], [8, 8]].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  ctx.fillStyle = 'rgb(255, 235, 140)';
  ctx.fillRect(4, 4, 1, 1);
  ctx.fillRect(11, 11, 1, 1);
}));

// --- Emerald ---
const emeraldTex = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 82, 200, 105, 18);
  ctx.fillStyle = 'rgb(32, 130, 60)';
  [[2, 2], [3, 2], [2, 3], [12, 2], [13, 2], [2, 12], [2, 13], [13, 12], [13, 13], [7, 7], [8, 8]].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  ctx.fillStyle = 'rgb(170, 245, 180)';
  ctx.fillRect(5, 5, 1, 1);
}));

// --- Stone / Cobblestone ---
const stoneTex = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 130, 130, 130, 30);
  scatter(ctx, 24, 100, 100, 100, 14);
  scatter(ctx, 12, 170, 170, 170, 10);
}));

// --- Netherite (dark) ---
const netherTex = makeTexture(makeCanvas((ctx) => {
  noisy(ctx, 0, 0, 16, 16, 68, 62, 62, 18);
  ctx.fillStyle = 'rgb(28, 24, 24)';
  [[2, 3], [3, 2], [12, 3], [13, 2], [2, 12], [3, 13], [12, 12], [13, 13], [6, 6], [7, 7], [8, 7], [9, 8]].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  ctx.fillStyle = 'rgb(95, 88, 88)';
  ctx.fillRect(4, 10, 1, 1);
  ctx.fillRect(11, 4, 1, 1);
}));

// ============================================================
// BLOCK FACTORIES
// ============================================================

function mat(tex) {
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0.04 });
}

function simpleBlock(tex) {
  const m = mat(tex);
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [m, m, m, m, m, m]);
}

function grassBlock() {
  const side = mat(grassSide);
  const top = mat(grassTop);
  const bot = mat(dirtTex);
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [side, side, top, bot, side, side]);
}

const BLOCK_FACTORIES = [
  grassBlock,
  () => simpleBlock(diamondTex),
  () => simpleBlock(goldTex),
  () => simpleBlock(emeraldTex),
  () => simpleBlock(stoneTex),
  () => simpleBlock(netherTex),
];

// ============================================================
// BACKGROUND SCENE
// ============================================================

function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff2d0, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x88aaff, 0.45);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  // Blocks
  const blocks = [];
  const count = window.innerWidth < 720 ? 9 : 16;
  for (let i = 0; i < count; i++) {
    const factory = BLOCK_FACTORIES[i % BLOCK_FACTORIES.length];
    const b = factory();
    const scale = 0.4 + Math.random() * 0.9;
    b.scale.setScalar(scale);
    const radius = 4 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.7;
    b.position.set(
      Math.cos(theta) * radius * Math.cos(phi),
      Math.sin(phi) * radius + (Math.random() - 0.5) * 2,
      Math.sin(theta) * radius * Math.cos(phi) - 4
    );
    b.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    b.userData = {
      rotX: (Math.random() - 0.5) * 0.2,
      rotY: (Math.random() - 0.5) * 0.25,
      bobOffset: Math.random() * Math.PI * 2,
      bobAmp: 0.15 + Math.random() * 0.25,
    };
    scene.add(b);
    blocks.push(b);
  }

  // Mouse parallax
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // Fog — theme-aware
  const applyTheme = () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    scene.fog = new THREE.Fog(isLight ? 0xF7F6F2 : 0x0B0B0E, 6, 22);
    ambient.intensity = isLight ? 0.85 : 0.55;
    key.intensity = isLight ? 0.85 : 1.1;
  };
  applyTheme();
  document.addEventListener('themechange', applyTheme);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.start(); });

  function loop() {
    requestAnimationFrame(loop);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = pointer.x * 0.6;
    camera.position.y = -pointer.y * 0.4;
    camera.lookAt(0, 0, -4);

    for (const b of blocks) {
      b.rotation.x += b.userData.rotX * dt;
      b.rotation.y += b.userData.rotY * dt;
      b.position.y += Math.sin(t * 0.7 + b.userData.bobOffset) * b.userData.bobAmp * dt * 0.6;
    }

    renderer.render(scene, camera);
  }
  loop();
}

// ============================================================
// HERO SCENE — stacked classic Minecraft earth slice
// ============================================================

function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.3, 7);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff2d0, 1.3);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc880, 0.7);
  rim.position.set(-4, 3, -2);
  scene.add(rim);

  // Stack group — grass → dirt → stone (classic slice)
  const stack = new THREE.Group();
  const grass = grassBlock();
  grass.position.y = 1;
  const dirt = simpleBlock(dirtTex);
  dirt.position.y = 0;
  const stone = simpleBlock(stoneTex);
  stone.position.y = -1;
  stack.add(grass, dirt, stone);
  stack.scale.setScalar(1.15);
  scene.add(stack);

  // Orbiting small blocks
  const orbiters = [];
  [goldTex, diamondTex, emeraldTex].forEach((tex, i) => {
    const b = simpleBlock(tex);
    b.scale.setScalar(0.38);
    b.userData = {
      angle: (i / 3) * Math.PI * 2,
      radius: 2.1,
      height: [0.6, -0.2, 0.2][i],
      speed: 0.4 + i * 0.05,
    };
    scene.add(b);
    orbiters.push(b);
  });

  // Particle dust
  const particleGeo = new THREE.BufferGeometry();
  const pCount = 60;
  const positions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xE8B547, size: 0.04, transparent: true, opacity: 0.55, sizeAttenuation: true })
  );
  scene.add(particles);

  // Mouse tilt
  const heroPointer = { x: 0, y: 0, tx: 0, ty: 0 };
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    heroPointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    heroPointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });
  canvas.parentElement.addEventListener('pointerleave', () => {
    heroPointer.tx = 0; heroPointer.ty = 0;
  });

  const applyTheme = () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    ambient.intensity = isLight ? 0.85 : 0.6;
    rim.intensity = isLight ? 0.4 : 0.7;
  };
  applyTheme();
  document.addEventListener('themechange', applyTheme);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.start(); });

  function loop() {
    requestAnimationFrame(loop);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    heroPointer.x += (heroPointer.tx - heroPointer.x) * 0.06;
    heroPointer.y += (heroPointer.ty - heroPointer.y) * 0.06;

    stack.rotation.y += dt * 0.3;
    stack.rotation.x = heroPointer.y * 0.15;
    stack.position.y = Math.sin(t * 0.8) * 0.08;
    stack.position.x = heroPointer.x * 0.15;

    for (const b of orbiters) {
      b.userData.angle += dt * b.userData.speed;
      b.position.set(
        Math.cos(b.userData.angle) * b.userData.radius,
        b.userData.height + Math.sin(t * 0.9 + b.userData.angle) * 0.15,
        Math.sin(b.userData.angle) * b.userData.radius
      );
      b.rotation.x += dt * 0.6;
      b.rotation.y += dt * 0.8;
    }

    particles.rotation.y += dt * 0.05;

    renderer.render(scene, camera);
  }
  loop();
}

// ============================================================
// BOOT
// ============================================================

if (!reduced) {
  initBackground();
  initHero();
}
