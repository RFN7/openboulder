// QR Code 3D da RFN (modelo Circuito), no rodapé. Carregado só quando o rodapé se aproxima da tela.
// O código fica legível depois da montagem (cerca de 3 s); depois disso, tudo que se move mantém a leitura.
// Para trocar o destino do QR: tools/build_qr_rfn.py gera a matriz abaixo e a imagem fixa assets/qr-rfn.jpg.
import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

// https://wa.me/5561994331877 · correção de erro H
const QR = {
  n: 33,
  m: ['111111100110000100011001101111111', '100000101011011110101010101000001', '101110100010000100000100001011101', '101110100001010011000010001011101', '101110100101111110001010001011101', '100000101011100100011001101000001', '111111101010101010101010101111111', '000000001100000100110100100000000', '000011110101111110111101001100010', '000111011011010000110011100100110', '011100100011110100001111111110010', '101001000000100000100100010011011', '110111100101100111011000001101001', '011000010101110100011111110001110', '010100100010001111010001110010110', '011010010000001000001100100111011', '100001110011110101010101011110110', '100011011001110001110001100000000', '011010101000110100011101111011000', '000010000001010100100100001100011', '000000111110010010100100000011001', '100111010100001100011110111100100', '000011101100101101001111100100000', '000010010010011100110111000001001', '111110101100010001111100111110001', '000000001110110001110111100010000', '111111101010100111100000101010010', '100000101101011001101011100011011', '101110101100110010011010111111000', '101110100100010010111101001111001', '101110100011010101111001011011100', '100000100011100010000101110110100', '111111100000110110000110101100101'],
};
const COLORS = { plate: '#f6f3ee', ink: '#0b0b0d', accent: '#b00d14', glow: '#ff2a32' };
const HOLE = 9;       // lado do espaço da logo, em módulos
const INTRO = 3.2;    // segundos de montagem
const MARGIN = 1.3;   // folga em volta da placa, para a rede de luzes aparecer

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const outCubic = t => 1 - Math.pow(1 - t, 3);
const inOut = t => t * t * (3 - 2 * t);
const outBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function roundedShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function layout() {
  const n = QR.n, half = (HOLE - 1) / 2, c0 = (n - 1) / 2, rand = rng(n * 97 + 13), mods = [];
  const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (QR.m[r][c] !== '1' || inFinder(r, c)) continue;
    const x = c - c0, y = c0 - r;
    if (Math.abs(x) <= half && Math.abs(y) <= half) continue;
    mods.push({ x, y, d: Math.hypot(x, y), s: rand(), s2: rand(), s3: rand() });
  }
  const f = 3 - c0;
  return { mods, maxd: Math.max(...mods.map(m => m.d)), size: n + 8, finders: [[f, -f], [-f, -f], [f, f]] };
}

function finderGroup(h, mat) {
  const g = new THREE.Group(), s = roundedShape(7, 7, .75);
  s.holes.push(roundedShape(5, 5, .3));
  const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 }), mat);
  const dot = new THREE.Mesh(new RoundedBoxGeometry(3, 3, h, 3, .22), mat);
  dot.position.z = h / 2;
  ring.castShadow = dot.castShadow = true;
  g.add(ring, dot);
  return g;
}

function plateMesh(size) {
  const geo = new THREE.ExtrudeGeometry(roundedShape(size, size, 1.6), { depth: 1.4, bevelEnabled: true, bevelSize: .18, bevelThickness: .18, bevelSegments: 2, curveSegments: 8 });
  geo.translate(0, 0, -1.4);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COLORS.plate, roughness: .9, metalness: 0 }));
  m.position.z = -.18;
  m.receiveShadow = true;
  return m;
}

function logoTile(size, tex, depth) {
  const g = new THREE.Group(), r = size * .13;
  const edge = new THREE.Mesh(new RoundedBoxGeometry(size + .5, size + .5, depth, 3, .28), new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: .5, metalness: .25 }));
  edge.castShadow = true;
  g.add(edge);
  const sg = new THREE.ShapeGeometry(roundedShape(size, size, r), 10), pos = sg.attributes.position, uv = sg.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / size + .5, pos.getY(i) / size + .5);
  const front = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: tex }));
  front.position.z = depth / 2 + .012;
  g.add(front);
  return g;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function buildScene(root, L, tex) {
  const count = L.mods.length, rand = rng(4242), glowT = glowTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: COLORS.glow, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(L.size * 1.9);
  glow.position.z = -14;
  root.add(glow);

  // rede de luzes atrás da placa
  const net = new THREE.Group(), nodes = [];
  for (let i = 0; i < 110; i++) {
    const a = rand() * Math.PI * 2, R = L.size * (.42 + rand() * .48);
    nodes.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, -3 - rand() * 14));
  }
  const seg = [];
  nodes.forEach((a, i) => {
    nodes.map((b, j) => ({ j, d: a.distanceTo(b) })).filter(o => o.j > i).sort((x, y) => x.d - y.d).slice(0, 2)
      .forEach(o => seg.push(a.x, a.y, a.z, nodes[o.j].x, nodes[o.j].y, nodes[o.j].z));
  });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  net.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: COLORS.glow, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })));
  net.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(nodes), new THREE.PointsMaterial({ color: COLORS.glow, size: .85, map: glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  root.add(net);

  const board = new THREE.Group();
  root.add(board);
  const rim = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(L.size + 1, L.size + 1, 2), 8), new THREE.MeshBasicMaterial({ color: COLORS.glow }));
  rim.position.z = -1.5;
  board.add(rim, plateMesh(L.size));

  const inst = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, .5, 2, .11), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .8, metalness: 0 }), count);
  inst.castShadow = true;
  inst.frustumCulled = false;
  const ink = new THREE.Color(COLORS.ink), acc = new THREE.Color(COLORS.accent), col = new THREE.Color(), d = new THREE.Object3D();
  for (let i = 0; i < count; i++) inst.setColorAt(i, ink);
  board.add(inst);

  const finderMat = new THREE.MeshStandardMaterial({ color: COLORS.ink, roughness: .8, metalness: 0 });
  const fs = L.finders.map(([x, y]) => { const g = finderGroup(.6, finderMat); g.position.set(x, y, 0); board.add(g); return g; });
  const logo = logoTile(HOLE - 1, tex, .7);
  board.add(logo);
  const sweep = L.maxd + 18;

  return {
    pose: t => { const e = inOut(clamp(t / 3)); return { yaw: lerp(.38, 0, e), pitch: lerp(-.18, 0, e), dist: lerp(1.08, 1, e) }; },
    update(t) {
      board.rotation.y = (1 - outCubic(clamp(t / 2.5))) * Math.PI * 1.25;
      net.rotation.z = t * .045;
      glow.material.opacity = .46 + .14 * Math.sin(t * 1.2);
      const T = Math.max(0, t - INTRO + .3), r1 = (T * 11) % sweep - 3, r2 = ((T * 11 + sweep / 2) % sweep) - 3, on = clamp(t - INTRO + .6);
      for (let i = 0; i < count; i++) {
        const m = L.mods[i];
        const p = clamp((t - .15 - m.s * 1.25) / 1.5), e = outCubic(p), R = lerp(L.size * (.9 + m.s * 1.1), 0, e);
        const a0 = Math.atan2(m.y, m.x) + (1 - e) * (3 + m.s2 * 3);
        const g = Math.max(Math.exp(-Math.pow((m.d - r1) / 2.1, 2)), Math.exp(-Math.pow((m.d - r2) / 2.1, 2))) * on;
        d.position.set(e >= 1 ? m.x : Math.cos(a0) * (m.d + R), e >= 1 ? m.y : Math.sin(a0) * (m.d + R), lerp(26 * (m.s3 - .5), 0, e) + .25 + g * .3);
        d.rotation.set((1 - e) * m.s * 6, (1 - e) * m.s2 * 6, 0);
        d.scale.setScalar(p <= 0 ? 0 : lerp(.2, .985, e));
        d.updateMatrix();
        inst.setMatrixAt(i, d.matrix);
        col.copy(ink).lerp(acc, Math.max(g, 1 - e));
        inst.setColorAt(i, col);
      }
      inst.instanceMatrix.needsUpdate = true;
      inst.instanceColor.needsUpdate = true;
      fs.forEach((g, i) => g.scale.setScalar(.001 + .999 * outBack(clamp((t - 1.1 - i * .15) / 1))));
      logo.scale.setScalar(.001 + .999 * outBack(clamp((t - 1.7) / .8)));
      logo.position.z = .85 + .18 * Math.sin(t * 1.5);
    },
  };
}

// Monta o QR dentro de `box`. A imagem fixa só some depois do primeiro quadro desenhado.
export async function init(box, logoUrl) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tex = await new THREE.TextureLoader().loadAsync(logoUrl);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const L = layout(), scene = new THREE.Scene(), root = new THREE.Group(), camera = new THREE.PerspectiveCamera(20, 1, 1, 900);
  scene.add(new THREE.AmbientLight('#ffffff', 1.55), root);
  const key = new THREE.DirectionalLight('#ffffff', 1.9);
  key.position.set(9, 14, 60);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -.0006;
  key.shadow.radius = 3;
  const sc = key.shadow.camera, e = L.size * .75;
  sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.near = 10; sc.far = 130;
  scene.add(key);

  const model = buildScene(root, L, tex);
  const dist = (L.size * .5 * MARGIN) / Math.tan(THREE.MathUtils.degToRad(10));
  camera.far = dist * 3;
  camera.updateProjectionMatrix();

  const size = () => renderer.setSize(box.clientWidth, box.clientWidth, false);
  size();
  new ResizeObserver(size).observe(box);

  const pointer = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
  box.addEventListener('pointermove', ev => {
    if (ev.pointerType !== 'mouse') return;   // no toque, o dedo só rola a página
    const b = box.getBoundingClientRect();
    pointer.x = (ev.clientX - b.left) / b.width * 2 - 1;
    pointer.y = (ev.clientY - b.top) / b.height * 2 - 1;
  });
  box.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });

  let t0 = null, seek = null, ready = false;
  function draw(now) {
    if (t0 === null) t0 = now;
    const t = seek ?? (reduced ? INTRO + 1 : (now - t0) / 1000);
    model.update(t);
    const pose = model.pose(t), settle = inOut(clamp((t - INTRO + .3) / 1)), sway = reduced ? 0 : .055;
    tilt.x += (pointer.x - tilt.x) * .08;
    tilt.y += (pointer.y - tilt.y) * .08;
    const yaw = pose.yaw + settle * (Math.sin(t * .7) * sway + tilt.x * .2);
    const pitch = pose.pitch + settle * (Math.sin(t * .53 + 1) * sway * .7 - tilt.y * .17);
    const D = dist * pose.dist;
    camera.position.set(Math.sin(yaw) * Math.cos(pitch) * D, Math.sin(pitch) * D, Math.cos(yaw) * Math.cos(pitch) * D);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (!ready) { ready = true; box.appendChild(renderer.domElement); box.classList.add('is-3d'); }
  }

  // só desenha com o rodapé na tela; a animação começa quando ele aparece
  new IntersectionObserver(([en]) => { renderer.setAnimationLoop(en.isIntersecting ? draw : null); }, { threshold: .25 }).observe(box);
  return { seek: v => { seek = v; }, pointer, tilt };
}
