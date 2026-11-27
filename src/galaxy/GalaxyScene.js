// The home-page galaxy's three.js scene: a ray-marched black hole rendered to a reduced-
// resolution target, with the project stars and an ambient spiral of particles drawn on
// top in the same camera space. Imperative on purpose: React only mounts and disposes it.
import * as THREE from 'three';

import {
  OMEGA_EXPONENT,
  OUTER_OMEGA,
  STAR_MAX_RADIUS,
  ambientSpiral,
  positionAt,
  seededRandom,
  spiralLayout,
  visibility,
} from './orbits';
import {
  blackHoleFragment,
  displayFragment,
  particleFragment,
  particleVertex,
  quadVertex,
} from './blackHoleShader';

const MAX_DPR = 2;
// The black-hole pass is the expensive one, so it starts below full resolution and
// steps down further if frames run slow. It never steps back up, so it can't oscillate.
// "Slow" is judged against the display's own refresh interval (the shortest frame seen),
// so a screen capped at 30fps (iOS Low Power Mode, battery savers) isn't mistaken for a
// struggling GPU. A GPU that can't hold 60fps on a 60Hz screen alternates 16ms and 33ms
// frames, which pushes the average well past 1.4x the shortest frame.
const START_SCALE = 0.75;
const MIN_SCALE = 0.35;
const SLOW_RATIO = 1.4;
// Below roughly 28fps is always too slow, whatever the display can do.
const ALWAYS_SLOW = 1 / 28;

// The spiral eases down to this fraction of its speed while a star is highlighted.
const HIGHLIGHT_SPEED = 0.1;
// Reduced motion shows one composed still, as if this many seconds had passed.
const STILL_TIME = 24;

const AMBIENT_COUNT = 2600;
const AMBIENT_COLOURS = ['#c7d2fe', '#e0e7ff', '#a5b4fc', '#fde68a', '#ffffff'];

const STAR_SIZE = 2.1;
const CORE_SIZE = 0.55;
const MIN_HIT_RADIUS = 26;
// Stars closer to the camera than this stop growing at the full perspective rate.
const NEAR_DEPTH = 30;

export default class GalaxyScene {
  /**
   * @param {HTMLElement} container element the canvas fills
   * @param {Array} projects entries from src/projects.js
   * @param {{ reducedMotion?: boolean, onFrame?: Function, onContextLost?: Function }} options
   * Throws if WebGL is unavailable, so the caller can fall back.
   */
  constructor(container, projects, { reducedMotion = false, onFrame, onContextLost } = {}) {
    this.container = container;
    this.projects = projects;
    this.reducedMotion = reducedMotion;
    this.onFrame = onFrame;
    this.onContextLost = onContextLost;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'galaxy-canvas';
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000, 1);
    this.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.renderer.setPixelRatio(this.dpr);

    this.handleContextLost = (event) => {
      event.preventDefault();
      if (this.onContextLost) this.onContextLost();
    };
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost);

    this.width = 1;
    this.height = 1;
    this.scale = START_SCALE;
    this.time = this.reducedMotion ? STILL_TIME : 0;
    this.elapsed = this.reducedMotion ? STILL_TIME : 0;
    this.speed = 1;
    this.frameAvg = 1 / 60;
    this.shortestFrame = Infinity;
    this.adaptTimer = -2; // let shaders compile before judging frame times
    this.highlighted = null;
    this.pointer = new THREE.Vector2();
    this.pointerEased = new THREE.Vector2();
    this.dirty = true;
    this.screen = [];

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    this.ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.PlaneGeometry(2, 2);

    try {
      this.buildBlackHole();
      this.buildAmbient();
      this.buildStars();
    } catch (error) {
      // Don't leave a live WebGL context behind for a scene the caller will never dispose.
      this.releaseContext();
      throw error;
    }
    container.appendChild(this.canvas);

    this.loop = this.loop.bind(this);
  }

  buildBlackHole() {
    this.target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
    this.bhUniforms = {
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3() },
      uCamWorld: { value: new THREE.Matrix4() },
      uProjInv: { value: new THREE.Matrix4() },
    };
    this.bhMaterial = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: blackHoleFragment,
      uniforms: this.bhUniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.bhScene = new THREE.Scene();
    this.bhScene.add(fullScreen(new THREE.Mesh(this.quad, this.bhMaterial)));

    this.displayMaterial = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: displayFragment,
      uniforms: { tMap: { value: this.target.texture } },
      depthTest: false,
      depthWrite: false,
    });
    this.displayScene = new THREE.Scene();
    this.displayScene.add(fullScreen(new THREE.Mesh(this.quad, this.displayMaterial)));
  }

  buildAmbient() {
    const particles = ambientSpiral(AMBIENT_COUNT, 7);
    const pick = seededRandom(11);
    const n = particles.length;
    const attrs = {
      aRadius: new Float32Array(n),
      aAngle: new Float32Array(n),
      aHeight: new Float32Array(n),
      aSize: new Float32Array(n),
      aBright: new Float32Array(n),
      aColor: new Float32Array(n * 3),
    };
    const colour = new THREE.Color();
    particles.forEach((p, i) => {
      attrs.aRadius[i] = p.radius;
      attrs.aAngle[i] = p.angle;
      attrs.aHeight[i] = p.height;
      attrs.aSize[i] = 0.06 + 0.1 * p.size;
      attrs.aBright[i] = p.brightness;
      colour.set(AMBIENT_COLOURS[Math.floor(pick() * AMBIENT_COLOURS.length)]);
      colour.toArray(attrs.aColor, i * 3);
    });

    this.ambientGeometry = new THREE.BufferGeometry();
    // Positions are computed in the vertex shader; this only sizes the draw call.
    this.ambientGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    this.ambientGeometry.setAttribute('aRadius', new THREE.BufferAttribute(attrs.aRadius, 1));
    this.ambientGeometry.setAttribute('aAngle', new THREE.BufferAttribute(attrs.aAngle, 1));
    this.ambientGeometry.setAttribute('aHeight', new THREE.BufferAttribute(attrs.aHeight, 1));
    this.ambientGeometry.setAttribute('aSize', new THREE.BufferAttribute(attrs.aSize, 1));
    this.ambientGeometry.setAttribute('aBright', new THREE.BufferAttribute(attrs.aBright, 1));
    this.ambientGeometry.setAttribute('aColor', new THREE.BufferAttribute(attrs.aColor, 3));

    this.ambientUniforms = {
      uElapsed: { value: 0 },
      uTime: { value: 0 },
      uOuterOmega: { value: OUTER_OMEGA },
      uMaxRadius: { value: STAR_MAX_RADIUS },
      uOmegaExponent: { value: OMEGA_EXPONENT },
      uPointScale: { value: 1 },
      uMaxPoint: { value: 12 * this.dpr },
      uCam: { value: new THREE.Vector3() },
    };
    this.ambientMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: this.ambientUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(this.ambientGeometry, this.ambientMaterial);
    points.frustumCulled = false;

    this.starScene = new THREE.Scene();
    this.starScene.add(points);
  }

  buildStars() {
    this.glowTexture = makeGlowTexture();
    const layout = spiralLayout(this.projects.length);
    this.stars = this.projects.map((project, i) => {
      const glowMaterial = new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: new THREE.Color(project.color),
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      });
      const coreMaterial = glowMaterial.clone();
      coreMaterial.color = new THREE.Color('#ffffff');
      const glow = new THREE.Sprite(glowMaterial);
      const core = new THREE.Sprite(coreMaterial);
      this.starScene.add(glow, core);
      return {
        id: project.id,
        orbit: layout[i],
        glow,
        core,
        emphasis: 0, // eases to 1 while highlighted
        position: new THREE.Vector3(),
      };
    });
  }

  start() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  loop(now) {
    this.raf = requestAnimationFrame(this.loop);
    // Clamp so a backgrounded tab doesn't jump the orbit forward when it returns.
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;

    if (this.reducedMotion) {
      if (!this.dirty) return;
      this.dirty = false;
      this.stars.forEach((s) => { s.emphasis = s.id === this.highlighted ? 1 : 0; });
    } else {
      this.time += dt;
      const targetSpeed = this.highlighted ? HIGHLIGHT_SPEED : 1;
      this.speed += (targetSpeed - this.speed) * Math.min(1, dt * 3);
      this.elapsed += dt * this.speed;
      this.pointerEased.lerp(this.pointer, Math.min(1, dt * 2));
      this.stars.forEach((s) => {
        const target = s.id === this.highlighted ? 1 : 0;
        s.emphasis += (target - s.emphasis) * Math.min(1, dt * 6);
      });
      this.adaptResolution(dt);
    }
    this.render();
  }

  adaptResolution(dt) {
    this.frameAvg = this.frameAvg * 0.95 + dt * 0.05;
    // Ignore sub-4ms intervals: rAF jitter, not a real refresh rate.
    if (dt > 0.004) this.shortestFrame = Math.min(this.shortestFrame, dt);
    this.adaptTimer += dt;
    if (this.adaptTimer < 1) return;
    this.adaptTimer = 0;
    const slow = this.frameAvg > Math.min(ALWAYS_SLOW, this.shortestFrame * SLOW_RATIO);
    if (slow && this.scale > MIN_SCALE) {
      this.scale = Math.max(MIN_SCALE, this.scale * 0.8);
      this.resizeTarget();
    }
  }

  updateCamera() {
    const aspect = this.width / this.height;
    // Pull back on narrow screens so the spiral still fits across.
    const distance = 33 * THREE.MathUtils.clamp(1.35 / aspect, 1, 2.8);
    const t = this.time;
    const azimuth = -0.5 + 0.18 * Math.sin(t * 0.045) + this.pointerEased.x * 0.15;
    const elevation = 0.24 + 0.035 * Math.sin(t * 0.06 + 1) - this.pointerEased.y * 0.05;
    this.camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    // Aim just above the hole: the near side of the spiral fans out below it, so this
    // keeps the whole scene visually centred.
    this.camera.lookAt(0, distance * 0.02, 0);
    this.camera.updateMatrixWorld();
  }

  render() {
    this.updateCamera();
    const cam = this.camera.position;

    this.bhUniforms.uTime.value = this.time;
    this.bhUniforms.uCamPos.value.copy(cam);
    this.bhUniforms.uCamWorld.value.copy(this.camera.matrixWorld);
    this.bhUniforms.uProjInv.value.copy(this.camera.projectionMatrixInverse);

    this.ambientUniforms.uElapsed.value = this.elapsed;
    this.ambientUniforms.uTime.value = this.time;
    this.ambientUniforms.uCam.value.copy(cam);

    const screen = [];
    const projected = new THREE.Vector3();
    const pixelsPerUnit = this.height / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
    for (const star of this.stars) {
      const p = positionAt(star.orbit, this.elapsed);
      star.position.set(p.x, p.y, p.z);
      const seen = visibility(cam, p);
      const twinkle = this.reducedMotion ? 1 : 1 + 0.08 * Math.sin(this.time * 2.1 + star.orbit.phase);
      const depth = star.position.distanceTo(cam);
      // Damp perspective growth so a star sweeping past the camera doesn't balloon.
      const nearDamping = Math.min(1, Math.pow(depth / NEAR_DEPTH, 0.75));
      const size = STAR_SIZE * nearDamping * (1 + 0.7 * star.emphasis) * twinkle;
      star.glow.position.copy(star.position);
      star.core.position.copy(star.position);
      star.glow.scale.setScalar(size);
      star.core.scale.setScalar(CORE_SIZE * (1 + 0.5 * star.emphasis));
      star.glow.material.opacity = seen * (0.85 + 0.15 * star.emphasis);
      star.core.material.opacity = seen;

      projected.copy(star.position).project(this.camera);
      screen.push({
        id: star.id,
        x: ((projected.x + 1) / 2) * this.width,
        y: ((1 - projected.y) / 2) * this.height,
        visible: projected.z < 1 ? seen : 0,
        radius: (size * pixelsPerUnit) / depth / 2,
      });
    }
    this.screen = screen;

    const renderer = this.renderer;
    renderer.setRenderTarget(this.target);
    renderer.clear();
    renderer.render(this.bhScene, this.ortho);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(this.displayScene, this.ortho);
    renderer.render(this.starScene, this.camera);

    if (this.onFrame) this.onFrame(screen, { width: this.width, height: this.height });
  }

  resize() {
    this.width = Math.max(1, this.container.clientWidth);
    this.height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.ambientUniforms.uPointScale.value =
      (this.height * this.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
    this.resizeTarget();
    this.dirty = true;
  }

  resizeTarget() {
    const w = Math.max(1, Math.round(this.width * this.dpr * this.scale));
    const h = Math.max(1, Math.round(this.height * this.dpr * this.scale));
    this.target.setSize(w, h);
    this.dirty = true;
  }

  /** Pointer position in -1..1 across the container, for camera parallax. */
  setPointer(x, y) {
    if (this.reducedMotion) return;
    this.pointer.set(x, y);
  }

  /** Highlight a star (and slow the spiral), or pass null to clear. */
  setHighlighted(id) {
    this.highlighted = id;
    this.dirty = true;
  }

  /** The project id under container-relative point (x, y), or null. */
  pick(x, y) {
    let best = null;
    let bestDistance = Infinity;
    for (const s of this.screen) {
      if (s.visible < 0.3) continue;
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < Math.max(MIN_HIT_RADIUS, s.radius) && d < bestDistance) {
        best = s.id;
        bestDistance = d;
      }
    }
    return best;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    if (this.resizeObserver) this.resizeObserver.disconnect();

    this.quad.dispose();
    this.ambientGeometry.dispose();
    this.bhMaterial.dispose();
    this.displayMaterial.dispose();
    this.ambientMaterial.dispose();
    this.stars.forEach((s) => {
      s.glow.material.dispose();
      s.core.material.dispose();
    });
    this.glowTexture.dispose();
    this.target.dispose();

    this.releaseContext();
    this.canvas.remove();
  }

  /**
   * Release the GPU context now rather than waiting for GC: browsers cap live contexts,
   * and every visit back to the home page creates a fresh one. The listener goes first,
   * because forcing the loss fires webglcontextlost.
   */
  releaseContext() {
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.dispose();
    // Already gone if the browser took it (the fallback path), and forcing it again warns.
    if (!this.renderer.getContext().isContextLost()) this.renderer.forceContextLoss();
  }
}

function fullScreen(mesh) {
  mesh.frustumCulled = false;
  return mesh;
}

/** A soft round glow with faint diffraction spikes, drawn once on a canvas. */
function makeGlowTexture() {
  const size = 128;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const glow = ctx.createRadialGradient(half, half, 0, half, half, half);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.1, 'rgba(255,255,255,0.85)');
  glow.addColorStop(0.3, 'rgba(255,255,255,0.25)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = 'lighter';
  const horizontal = ctx.createLinearGradient(0, 0, size, 0);
  const vertical = ctx.createLinearGradient(0, 0, 0, size);
  for (const g of [horizontal, vertical]) {
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
  }
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, half - 1, size, 2);
  ctx.fillStyle = vertical;
  ctx.fillRect(half - 1, 0, 2, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
