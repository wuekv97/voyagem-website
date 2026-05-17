import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const DEG2RAD = Math.PI / 180;
const S = 1 / 16;

// ============================================================
// PROCEDURAL TEXTURES (background floating blocks)
// ============================================================

function makeCanvas(fillFn) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
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
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const v = (Math.random() - 0.5) * range;
      ctx.fillStyle = `rgb(${clamp(r+v)},${clamp(g+v)},${clamp(b+v)})`;
      ctx.fillRect(x, y, 1, 1);
    }
}

function scatter(ctx, n, r, g, b, range) {
  for (let i = 0; i < n; i++) {
    const v = (Math.random() - 0.5) * range;
    ctx.fillStyle = `rgb(${clamp(r+v)},${clamp(g+v)},${clamp(b+v)})`;
    ctx.fillRect(Math.floor(Math.random()*16), Math.floor(Math.random()*16), 1, 1);
  }
}

const crystalTex = makeTexture(makeCanvas(ctx => {
  noisy(ctx, 0, 0, 16, 16, 90, 220, 200, 28);
  scatter(ctx, 20, 60, 180, 200, 20);
  scatter(ctx, 10, 180, 255, 240, 14);
  ctx.fillStyle = 'rgba(200,255,250,0.6)';
  [[4,4],[11,3],[7,9],[3,12],[13,7]].forEach(([x,y]) => ctx.fillRect(x,y,1,1));
}));

const voyageOreTex = makeTexture(makeCanvas(ctx => {
  noisy(ctx, 0, 0, 16, 16, 62, 58, 80, 22);
  scatter(ctx, 16, 40, 36, 60, 12);
  [[2,3],[3,2],[4,3],[3,4],[11,10],[12,9],[13,10],[12,11],[7,7]].forEach(([x,y]) => {
    ctx.fillStyle = `rgb(${clamp(100+(Math.random()-0.5)*20)},${clamp(60+(Math.random()-0.5)*20)},${clamp(200+(Math.random()-0.5)*20)})`;
    ctx.fillRect(x,y,1,1);
  });
  scatter(ctx, 6, 140, 90, 255, 18);
}));

const crystalBrickTex = makeTexture(makeCanvas(ctx => {
  noisy(ctx, 0, 0, 16, 16, 70, 190, 175, 20);
  for (let x = 0; x < 16; x++) {
    ctx.fillStyle = `rgb(${clamp(40+(Math.random()-0.5)*10)},${clamp(140+(Math.random()-0.5)*10)},${clamp(130+(Math.random()-0.5)*10)})`;
    ctx.fillRect(x, 4, 1, 1);
    ctx.fillRect(x, 12, 1, 1);
  }
  for (let y = 0; y < 4; y++) {
    ctx.fillStyle = `rgb(${clamp(40)},${clamp(140)},${clamp(130)})`;
    ctx.fillRect(8, y, 1, 1);
    ctx.fillRect(0, y+5, 1, 1);
    ctx.fillRect(8, y+13, 1, 1);
  }
  scatter(ctx, 8, 160, 240, 220, 14);
}));

const purpleCrystalTex = makeTexture(makeCanvas(ctx => {
  noisy(ctx, 0, 0, 16, 16, 130, 80, 200, 26);
  scatter(ctx, 18, 100, 50, 180, 20);
  scatter(ctx, 8, 200, 160, 255, 16);
  [[5,5],[10,4],[3,10],[12,11]].forEach(([x,y]) => {
    ctx.fillStyle = 'rgb(230,210,255)';
    ctx.fillRect(x, y, 1, 1);
  });
}));

const netherTex = makeTexture(makeCanvas(ctx => {
  noisy(ctx, 0, 0, 16, 16, 68, 62, 62, 18);
  scatter(ctx, 12, 28, 24, 24, 12);
  scatter(ctx, 8, 95, 88, 88, 8);
}));

// ============================================================
// BOX BUILDERS
// ============================================================

function mat(tex, opts = {}) {
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0.04, ...opts });
}

function simpleBlock(tex, opts) {
  const m = mat(tex, opts);
  return new THREE.Mesh(new THREE.BoxGeometry(1,1,1), [m,m,m,m,m,m]);
}

const BG_FACTORIES = [
  () => simpleBlock(crystalTex),
  () => simpleBlock(voyageOreTex),
  () => simpleBlock(crystalBrickTex),
  () => simpleBlock(purpleCrystalTex),
  () => simpleBlock(netherTex),
  () => simpleBlock(crystalTex, { emissive: new THREE.Color(0x00ffcc), emissiveIntensity: 0.08 }),
  () => simpleBlock(purpleCrystalTex, { emissive: new THREE.Color(0x8800ff), emissiveIntensity: 0.06 }),
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

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff2d0, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8844cc, 0.5);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  const blocks = [];
  const count = window.innerWidth < 720 ? 9 : 16;
  for (let i = 0; i < count; i++) {
    const b = BG_FACTORIES[i % BG_FACTORIES.length]();
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
    b.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    b.userData = {
      rotX: (Math.random()-0.5)*0.2,
      rotY: (Math.random()-0.5)*0.25,
      bobOffset: Math.random()*Math.PI*2,
      bobAmp: 0.15 + Math.random()*0.25,
    };
    scene.add(b);
    blocks.push(b);
  }

  const pointer = { x:0, y:0, tx:0, ty:0 };
  window.addEventListener('pointermove', e => {
    pointer.tx = (e.clientX/window.innerWidth)*2-1;
    pointer.ty = (e.clientY/window.innerHeight)*2-1;
  }, { passive: true });

  const applyTheme = () => {
    const light = document.documentElement.dataset.theme === 'light';
    scene.fog = new THREE.Fog(light ? 0xF7F6F2 : 0x0B0B0E, 6, 22);
    ambient.intensity = light ? 0.85 : 0.55;
    key.intensity = light ? 0.85 : 1.1;
  };
  applyTheme();
  document.addEventListener('themechange', applyTheme);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
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
      b.position.y += Math.sin(t*0.7 + b.userData.bobOffset) * b.userData.bobAmp * dt * 0.6;
    }
    renderer.render(scene, camera);
  }
  loop();
}

// ============================================================
// ANIMATION SYSTEM
// ============================================================

function parseFrames(channelObj) {
  if (!channelObj || typeof channelObj !== 'object') return [];
  const entries = Object.entries(channelObj);
  const frames = [];
  for (const [tKey, val] of entries) {
    const t = parseFloat(tKey);
    if (isNaN(t)) continue;
    let v;
    if (Array.isArray(val)) v = val;
    else if (val && Array.isArray(val.vector)) v = val.vector;
    else continue;
    frames.push({ t, v });
  }
  return frames.sort((a, b) => a.t - b.t);
}

function lerpFrames(frames, t) {
  if (!frames.length) return [0, 0, 0];
  if (t <= frames[0].t) return [...frames[0].v];
  const last = frames[frames.length - 1];
  if (t >= last.t) return [...last.v];
  let i = 0;
  while (i < frames.length - 1 && frames[i + 1].t <= t) i++;
  const f0 = frames[i], f1 = frames[i + 1];
  const a = (t - f0.t) / (f1.t - f0.t);
  return [
    f0.v[0] + (f1.v[0] - f0.v[0]) * a,
    f0.v[1] + (f1.v[1] - f0.v[1]) * a,
    f0.v[2] + (f1.v[2] - f0.v[2]) * a,
  ];
}

class AnimationPlayer {
  constructor(boneByName, animData, nameMap = {}) {
    this.length = animData.animation_length;
    this.entries = [];

    for (const [animBone, boneAnim] of Object.entries(animData.bones)) {
      const targetName = nameMap[animBone] !== undefined ? nameMap[animBone] : animBone;
      const bone = boneByName.get(targetName);
      if (!bone) continue;

      const rotFrames = boneAnim.rotation ? parseFrames(boneAnim.rotation) : null;
      const posFrames = boneAnim.position ? parseFrames(boneAnim.position) : null;
      if (rotFrames || posFrames) {
        this.entries.push({ bone, rotFrames, posFrames });
      }
    }
  }

  update(elapsedTime) {
    const t = ((elapsedTime % this.length) + this.length) % this.length;
    for (const { bone, rotFrames, posFrames } of this.entries) {
      const rest = bone.userData.restPosition;
      if (rotFrames) {
        const [rx, ry, rz] = lerpFrames(rotFrames, t);
        bone.rotation.set(rx * DEG2RAD, ry * DEG2RAD, rz * DEG2RAD, 'ZYX');
      }
      if (posFrames && rest) {
        const [dx, dy, dz] = lerpFrames(posFrames, t);
        bone.position.set(rest.x + dx * S, rest.y + dy * S, rest.z + dz * S);
      }
    }
  }
}

// ============================================================
// BBMODEL BONE LOADER
// ============================================================

function buildElementGeometry(el, boneOrigin, texW, texH) {
  if (el.export === false) return null;

  const [ox, oy, oz] = boneOrigin;
  const x1 = (el.from[0] - ox) * S, y1 = (el.from[1] - oy) * S, z1 = (el.from[2] - oz) * S;
  const x2 = (el.to[0] - ox) * S, y2 = (el.to[1] - oy) * S, z2 = (el.to[2] - oz) * S;

  const faceDefs = [
    { key: 'north', norm: [0, 0, -1], v: [[x2,y2,z1],[x1,y2,z1],[x1,y1,z1],[x2,y1,z1]] },
    { key: 'south', norm: [0, 0,  1], v: [[x1,y2,z2],[x2,y2,z2],[x2,y1,z2],[x1,y1,z2]] },
    { key: 'east',  norm: [1, 0,  0], v: [[x2,y2,z2],[x2,y2,z1],[x2,y1,z1],[x2,y1,z2]] },
    { key: 'west',  norm: [-1,0,  0], v: [[x1,y2,z1],[x1,y2,z2],[x1,y1,z2],[x1,y1,z1]] },
    { key: 'up',    norm: [0, 1,  0], v: [[x1,y2,z1],[x2,y2,z1],[x2,y2,z2],[x1,y2,z2]] },
    { key: 'down',  norm: [0,-1,  0], v: [[x2,y1,z1],[x1,y1,z1],[x1,y1,z2],[x2,y1,z2]] },
  ];

  const positions = [], normals = [], uvs = [], idx = [];

  for (const face of faceDefs) {
    const fd = el.faces?.[face.key];
    if (!fd || fd.texture == null || fd.texture < 0) continue;
    const [u1, v1, u2, v2] = fd.uv;
    const nu1 = u1 / texW, nv1 = v1 / texH, nu2 = u2 / texW, nv2 = v2 / texH;
    const base = positions.length / 3;
    for (const [vx, vy, vz] of face.v) { positions.push(vx, vy, vz); normals.push(...face.norm); }
    uvs.push(nu1, nv1, nu2, nv1, nu2, nv2, nu1, nv2);
    idx.push(base, base+1, base+2, base, base+2, base+3);
  }

  if (!positions.length) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(normals),   3));
  geo.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uvs),       2));
  geo.setIndex(idx);
  return geo;
}

function buildBBModelGroup(data) {
  const texW = data.resolution.width;
  const texH = data.resolution.height;

  const texSrc = data.textures[0].source;
  const texture = new THREE.TextureLoader().load(texSrc);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: false,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.85,
    metalness: 0.0,
  });

  // Build element UUID → element lookup
  const elementByUuid = new Map();
  for (const el of data.elements) elementByUuid.set(el.uuid, el);

  const boneByName = new Map();
  const root = new THREE.Group();

  function addElement(el, boneGroup, boneOrigin) {
    if (!el || el.export === false) return;
    const geo = buildElementGeometry(el, boneOrigin, texW, texH);
    if (geo) boneGroup.add(new THREE.Mesh(geo, material));
  }

  function processItem(item, parentGroup, parentOrigin) {
    if (typeof item === 'string') {
      addElement(elementByUuid.get(item), parentGroup, parentOrigin);
      return;
    }
    if (typeof item !== 'object' || !item.uuid) return;

    // Group object is inline in outliner — use it directly
    const origin = item.origin || [0, 0, 0];
    const boneGroup = new THREE.Group();
    boneGroup.name = item.name || item.uuid;

    boneGroup.position.set(
      (origin[0] - parentOrigin[0]) * S,
      (origin[1] - parentOrigin[1]) * S,
      (origin[2] - parentOrigin[2]) * S
    );
    boneGroup.userData.restPosition = boneGroup.position.clone();

    boneByName.set(boneGroup.name, boneGroup);
    parentGroup.add(boneGroup);

    for (const child of (item.children || [])) {
      processItem(child, boneGroup, origin);
    }
  }

  for (const item of (data.outliner || [])) {
    processItem(item, root, [0, 0, 0]);
  }

  // Center model: feet at y=0, centered on XZ
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;

  return { group: root, boneByName };
}

async function loadBBModel(url) {
  const data = await fetch(url).then(r => r.json());
  return buildBBModelGroup(data);
}

// Fatling: animation bone names (Russian) → BBModel group names (English)
const FATLING_IDLE_MAP = {
  'тело':         'body',
  'голова':       'head',
  'левая рука':   'l arm',
  'правая рука':  'r arm',
  'флаг':         'flag',
  'плащи перед':  'cloack f',
  'плащи зад':    'cloack b',
  'левая нога':   'l leg',
  'правая нога':  'r leg',
};

// Crusher: animation bone names (Russian) → BBModel group names (English)
const CRUSHER_IDLE_MAP = {
  'тело':                     'body',
  'голова':                   'head',
  'кисть левая':              'l hand b',
  'плече левое':              'l hand t',
  'плече правое':             'r hand t',
  'кисть правая':             'r hand b',
  'задний плащ правой ноги':  'r leg cloack b',
  'задний плащ левой ноги':   'l leg cloack b',
  'цепь':                     'chain',
  'левое бедро':              'l leg',
  'правое бедро':             'r leg',
  'левая пятка':              'l eg b',
  'правая пятка':             'r leg b',
};

// ============================================================
// HERO SCENE — VoyageM custom mobs
// ============================================================

async function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
  camera.position.set(0, 1.7, 6.8);
  camera.lookAt(0, 1.15, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Crystal dungeon lighting
  const ambient = new THREE.AmbientLight(0xc0b0f0, 0.45);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffd8a8, 1.5);
  key.position.set(3, 7, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6622cc, 1.0);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0x00ccff, 0.4);
  fill.position.set(1, -1, 4);
  scene.add(fill);

  const crystalGlow = new THREE.PointLight(0x44ffcc, 1.2, 8);
  crystalGlow.position.set(0, 1.5, 1.5);
  scene.add(crystalGlow);

  // Crystal block orbiters
  const orbiters = [];
  const orbitDefs = [
    { angle: 0,           radius: 2.8, height: 0.9, speed: 0.35, scale: 0.55 },
    { angle: Math.PI*0.7, radius: 2.4, height: 1.6, speed: 0.28, scale: 0.4  },
    { angle: Math.PI*1.4, radius: 3.0, height: 0.4, speed: 0.42, scale: 0.45 },
  ];

  try {
    const crystalData = await fetch('assets/models/crystal_bricks.bbmodel').then(r => r.json());
    for (const def of orbitDefs) {
      const { group } = buildBBModelGroup(crystalData);
      group.scale.setScalar(def.scale);
      group.userData = { ...def };
      scene.add(group);
      orbiters.push(group);
    }
  } catch {
    for (const def of orbitDefs) {
      const block = simpleBlock(crystalTex, { emissive: new THREE.Color(0x00ffcc), emissiveIntensity: 0.15 });
      block.scale.setScalar(def.scale);
      block.userData = { ...def };
      scene.add(block);
      orbiters.push(block);
    }
  }

  // Ground plane
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a0d2e, transparent: true, opacity: 0.45, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  // Glow ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 2.3, 64),
    new THREE.MeshBasicMaterial({ color: 0x44ffcc, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  scene.add(ring);

  // Particle sparkles
  const pCount = 80;
  const pPos = new Float32Array(pCount * 3);
  const pPhases = new Float32Array(pCount);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random()-0.5)*5;
    pPos[i*3+1] = Math.random()*3.5;
    pPos[i*3+2] = (Math.random()-0.5)*3;
    pPhases[i]  = Math.random() * Math.PI * 2;
  }
  const pGeo = new THREE.BufferGeometry();
  const pAttr = new THREE.BufferAttribute(pPos, 3);
  pGeo.setAttribute('position', pAttr);
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x88ffee, size: 0.025, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
  scene.add(particles);

  // Mob group container
  const mobs = new THREE.Group();
  scene.add(mobs);

  let fatlingPlayer = null, crusherPlayer = null;

  canvas.classList.add('loading');

  try {
    // Load models and animations in parallel
    const [fatlingResult, crusherResult, fatlingAnim, crusherAnim] = await Promise.all([
      loadBBModel('assets/models/fatling.bbmodel'),
      loadBBModel('assets/models/crusher.bbmodel'),
      fetch('assets/models/fatling.animation.json').then(r => r.json()).catch(() => null),
      fetch('assets/models/crusher.animation.json').then(r => r.json()).catch(() => null),
    ]);

    const fatling = fatlingResult.group;
    const crusher = crusherResult.group;

    // Both facing the camera; BBModel "front" sits at -Z, so rotate 180°
    fatling.position.set(-1.1, 0, 0.6);
    fatling.rotation.y = Math.PI;
    mobs.add(fatling);

    crusher.position.set(1.15, 0, -0.3);
    crusher.rotation.y = Math.PI;
    crusher.scale.setScalar(0.95);
    mobs.add(crusher);

    // Set up animation players for idle animations
    if (fatlingAnim?.animations?.['animation.fatling.idle']) {
      fatlingPlayer = new AnimationPlayer(
        fatlingResult.boneByName,
        fatlingAnim.animations['animation.fatling.idle'],
        FATLING_IDLE_MAP
      );
    }

    if (crusherAnim?.animations?.['animation.crasher.idle']) {
      crusherPlayer = new AnimationPlayer(
        crusherResult.boneByName,
        crusherAnim.animations['animation.crasher.idle'],
        CRUSHER_IDLE_MAP
      );
    }

    canvas.classList.remove('loading');
  } catch (e) {
    console.warn('Mob load failed:', e);
    canvas.classList.remove('loading');
    // Fallback: crystal blocks
    [crystalTex, purpleCrystalTex, voyageOreTex].forEach((tex, i) => {
      const b = simpleBlock(tex);
      b.position.set((i-1)*1.3, 0.5, 0);
      mobs.add(b);
    });
  }

  // Mouse tilt
  const heroPtr = { x: 0, y: 0, tx: 0, ty: 0 };
  const heroWrap = canvas.parentElement;
  heroWrap.addEventListener('pointermove', e => {
    const r = heroWrap.getBoundingClientRect();
    heroPtr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    heroPtr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });
  heroWrap.addEventListener('pointerleave', () => { heroPtr.tx = 0; heroPtr.ty = 0; });

  const applyTheme = () => {
    const light = document.documentElement.dataset.theme === 'light';
    ambient.intensity = light ? 0.6 : 0.45;
    rim.intensity = light ? 0.5 : 1.0;
    crystalGlow.intensity = light ? 0.6 : 1.2;
  };
  applyTheme();
  document.addEventListener('themechange', applyTheme);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
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

    // Smooth mouse tilt
    heroPtr.x += (heroPtr.tx - heroPtr.x) * 0.06;
    heroPtr.y += (heroPtr.ty - heroPtr.y) * 0.06;

    // Mob group: static with subtle mouse parallax — no auto-rotation
    mobs.rotation.x = heroPtr.y * 0.06;
    mobs.rotation.y = heroPtr.x * 0.08;

    // Idle animations — offset by 1s so they're out of phase
    if (fatlingPlayer) fatlingPlayer.update(t);
    if (crusherPlayer) crusherPlayer.update(t + 1.0);

    // Crystal block orbiters
    for (const b of orbiters) {
      const d = b.userData;
      d.angle += dt * d.speed;
      b.position.set(
        Math.cos(d.angle) * d.radius,
        d.height + Math.sin(t * 0.9 + d.angle) * 0.2,
        Math.sin(d.angle) * d.radius
      );
      b.rotation.x += dt * 0.7;
      b.rotation.y += dt * 0.9;
    }

    // Crystal glow pulse
    crystalGlow.intensity = 1.0 + Math.sin(t * 2.1) * 0.3;

    // Ring pulse
    ring.material.opacity = 0.09 + Math.sin(t * 1.5) * 0.04;

    // Particles drift upward and wrap
    for (let i = 0; i < pCount; i++) {
      pAttr.array[i*3+1] += dt * (0.15 + Math.sin(pPhases[i] + t * 0.4) * 0.08);
      if (pAttr.array[i*3+1] > 3.8) {
        pAttr.array[i*3+1] = 0;
        pAttr.array[i*3]   = (Math.random()-0.5)*5;
        pAttr.array[i*3+2] = (Math.random()-0.5)*3;
      }
    }
    pAttr.needsUpdate = true;

    renderer.render(scene, camera);
  }
  loop();
}

// ============================================================
// MOB PORTRAIT — single-mob isolated canvas for spotlight cards
// ============================================================

const MOB_REGISTRY = {
  fatling: {
    model:   'assets/models/fatling.bbmodel',
    anim:    'assets/models/fatling.animation.json',
    animKey: 'animation.fatling.idle',
    map:     FATLING_IDLE_MAP,
    scale:   1.0,
    camPos:  [0, 1.4, 4.0],
    target:  [0, 1.1, 0],
    fov:     34,
  },
  crusher: {
    model:   'assets/models/crusher.bbmodel',
    anim:    'assets/models/crusher.animation.json',
    animKey: 'animation.crasher.idle',
    map:     CRUSHER_IDLE_MAP,
    scale:   0.85,
    camPos:  [0, 1.7, 4.4],
    target:  [0, 1.3, 0],
    fov:     34,
  },
};

async function initMobPortrait(canvasId, mobKey) {
  const def = MOB_REGISTRY[mobKey];
  const canvas = document.getElementById(canvasId);
  if (!def || !canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(def.fov || 32, 1, 0.1, 30);
  camera.position.set(...(def.camPos || [0, 1.4, 4.2]));
  camera.lookAt(...(def.target || [0, 1.1, 0]));

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Dramatic single-subject lighting
  const ambient = new THREE.AmbientLight(0xa090d0, 0.5);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffd8a8, 1.6);
  key.position.set(3, 6, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6622cc, 1.1);
  rim.position.set(-4, 3, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x44ccff, 0.45);
  fill.position.set(0, -1, 3);
  scene.add(fill);

  // Pedestal ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.05, 64),
    new THREE.MeshBasicMaterial({ color: 0x44ffcc, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.01;
  scene.add(ring);

  let animPlayer = null;
  try {
    const { group, boneByName } = await loadBBModel(def.model);
    group.rotation.y = 0;
    group.scale.setScalar(def.scale);
    scene.add(group);
    const animData = await fetch(def.anim).then(r => r.json()).catch(() => null);
    if (animData?.animations?.[def.animKey]) {
      animPlayer = new AnimationPlayer(boneByName, animData.animations[def.animKey], def.map);
    }
  } catch (e) {
    console.warn(`Mob portrait ${mobKey} load failed:`, e);
  }

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.parentElement.getBoundingClientRect();
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });
  canvas.parentElement.addEventListener('pointerleave', () => { ptr.tx = 0; ptr.ty = 0; });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.start(); });

  // Pause when off-screen
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 }).observe(canvas);

  function loop() {
    requestAnimationFrame(loop);
    if (!running || !visible) return;
    const t = clock.elapsedTime;
    ptr.x += (ptr.tx - ptr.x) * 0.08;
    ptr.y += (ptr.ty - ptr.y) * 0.08;
    if (animPlayer) animPlayer.update(t);
    scene.rotation.y = ptr.x * 0.25;
    scene.rotation.x = ptr.y * 0.08;
    ring.material.opacity = 0.14 + Math.sin(t * 1.7) * 0.05;
    renderer.render(scene, camera);
  }
  loop();
}

// Expose to inline scripts
window.initMobPortrait = initMobPortrait;

// ============================================================
// BOOT
// ============================================================

if (!reduced) {
  initBackground();
  initHero();
}
