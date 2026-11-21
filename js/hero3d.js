/* =========================================================
   JIREH DIGITAL — Hero WebGL layer (Three.js)
   Progressive enhancement: only loads on capable devices.
   If anything fails, the CSS 3D scene remains as the fallback.
   ========================================================= */

const canvas = document.getElementById('hero-canvas');

function canRun3D() {
  if (!canvas) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = navigator.connection || {};
  if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')) return false;
  if (navigator.deviceMemory && navigator.deviceMemory < 3) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

async function init() {
  if (!canRun3D()) return;

  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
  } catch (e) {
    return; // CDN unavailable — keep CSS fallback
  }

  const hero = canvas.parentElement;
  const isMobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  /* --- Particle field (gold + electric blue + purple) --- */
  const COUNT = isMobile ? 700 : 1600;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [new THREE.Color('#e3b552'), new THREE.Color('#3d7bff'), new THREE.Color('#8b5cf6'), new THREE.Color('#5fa8ff')];
  for (let i = 0; i < COUNT; i++) {
    const r = 6 + Math.random() * 14;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi) - 6;
    const c = palette[Math.random() < 0.3 ? 0 : 1 + Math.floor(Math.random() * 3)];
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // soft round sprite
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  const g = sprite.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const pMat = new THREE.PointsMaterial({
    size: isMobile ? 0.16 : 0.13, map: new THREE.CanvasTexture(sprite), vertexColors: true,
    transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* --- Glowing wireframe forms --- */
  const group = new THREE.Group();
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.2, 1),
    new THREE.MeshBasicMaterial({ color: 0x5fa8ff, wireframe: true, transparent: true, opacity: 0.18 })
  );
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xe3b552, transparent: true, opacity: 0.55 })
  );
  torus.rotation.x = Math.PI / 2.4;
  const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(5.6, 0.008, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.45 })
  );
  torus2.rotation.set(Math.PI / 1.8, 0.4, 0);
  group.add(ico, torus, torus2);
  scene.add(group);

  /* --- Layout --- */
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // place the geometric form behind the mockups on desktop, centred lower on mobile
    if (w > 960) group.position.set(5.2, 0.2, -2);
    else group.position.set(0, -3.2, -4);
  }
  resize();
  window.addEventListener('resize', resize);

  /* --- Interaction --- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', e => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) loop(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) loop(); });

  /* --- Render loop --- */
  const clock = new THREE.Clock();
  let running = false;
  function loop() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    particles.rotation.y = t * 0.025 + mouse.x * 0.15;
    particles.rotation.x = mouse.y * 0.08;
    ico.rotation.x = t * 0.12; ico.rotation.y = t * 0.18;
    torus.rotation.z = t * 0.2;
    torus2.rotation.z = -t * 0.14;
    group.rotation.y = mouse.x * 0.25;
    group.rotation.x = mouse.y * 0.15;
    group.position.y += Math.sin(t * 0.8) * 0.002;

    const scrollFade = Math.max(0, 1 - window.scrollY / (hero.clientHeight * 0.9));
    canvas.style.opacity = String(scrollFade);
    camera.position.y = -window.scrollY * 0.003;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  canvas.classList.add('is-ready');
  loop();
}

init();
