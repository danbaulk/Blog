// GLSL for the home-page galaxy.
//
// The black hole is a full-screen pass that ray-marches bent light. Units match orbits.js:
// event horizon radius 1, accretion disk from DISK_INNER to DISK_OUTER in the y = 0 plane.
// Each ray is stepped with acceleration -1.5 * h^2 * p / |p|^5 (h = angular momentum),
// the standard trick that reproduces Schwarzschild light bending: rays inside the photon
// sphere fall in (the shadow), grazing rays wrap round (the photon ring), and rays that
// cross the disk plane behind the hole are bent up and over it (the Interstellar arch).
import { DISK_INNER, DISK_OUTER, SHADOW_RADIUS } from './orbits';

const glslFloat = (n) => (Number.isInteger(n) ? `${n}.0` : `${n}`);

export const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const noise = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }
`;

export const blackHoleFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform mat4 uCamWorld;
  uniform mat4 uProjInv;
  varying vec2 vUv;

  const float DISK_IN = ${glslFloat(DISK_INNER)};
  const float DISK_OUT = ${glslFloat(DISK_OUTER)};
  const int STEPS = 240;

  ${noise}

  // Emission and opacity of the disk where a ray crosses it at q (radius r).
  vec4 disk(vec3 q, float r, vec3 rayDir) {
    float t = (r - DISK_IN) / (DISK_OUT - DISK_IN);

    // Keplerian swirl: inner gas laps the outer gas, which shears the noise into streaks.
    float omega = 3.2 * pow(r, -1.5);
    float a = atan(q.z, q.x) - uTime * omega;
    vec2 ring = vec2(cos(a), sin(a));
    float clumps = fbm(vec3(ring * 2.6, r * 1.9));
    float streaks = fbm(vec3(ring * 7.0, r * 6.5));

    float density = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.45, 1.0, t));
    density *= 0.15 + 1.5 * clumps * clumps + 0.7 * streaks * streaks;

    // Temperature: white-hot at the inner edge, through orange, to a deep red rim.
    vec3 colour = mix(vec3(1.25, 1.05, 0.85), vec3(1.15, 0.45, 0.12), smoothstep(0.0, 0.3, t));
    colour = mix(colour, vec3(0.45, 0.08, 0.04), smoothstep(0.3, 1.0, t));

    // Doppler beaming: the side of the disk turning towards the camera is brighter.
    vec3 tangent = normalize(vec3(-q.z, 0.0, q.x));
    float beta = 0.5 * sqrt(DISK_IN / r);
    float doppler = sqrt(1.0 - beta * beta) / (1.0 - beta * dot(tangent, -rayDir));
    doppler = pow(doppler, 2.6);

    float intensity = 0.12 + 1.5 * pow(1.0 - t, 2.0);
    float alpha = clamp(density * 0.85, 0.0, 0.96);
    return vec4(colour * intensity * density * doppler, alpha);
  }

  vec3 background(vec3 d) {
    // Faint indigo nebula, in the site's accent family.
    float n = fbm(d * 2.4 + vec3(0.0, 0.0, uTime * 0.002));
    vec3 col = mix(vec3(0.004, 0.004, 0.012), vec3(0.07, 0.045, 0.17), smoothstep(0.5, 0.9, n)) * 0.45;
    col += vec3(0.04, 0.012, 0.05) * smoothstep(0.68, 0.95, fbm(d * 5.0 + 3.0));

    // Two layers of point stars, hashed on a 3D grid so they stick to the sky.
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 520.0 : 1100.0;
      float threshold = layer == 0 ? 0.9975 : 0.9982;
      vec3 cell = floor(d * scale);
      float h = hash(cell + float(layer) * 31.7);
      if (h > threshold) {
        vec3 f = fract(d * scale) - 0.5;
        float glow = smoothstep(0.55, 0.0, length(f));
        float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + h * 3.0) + h * 400.0);
        float bright = (h - threshold) / (1.0 - threshold);
        vec3 tint = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.9, 0.75), fract(h * 91.0));
        col += tint * glow * twinkle * (0.4 + 1.6 * bright);
      }
    }
    return col;
  }

  void main() {
    vec2 ndc = vUv * 2.0 - 1.0;
    vec4 view = uProjInv * vec4(ndc, 1.0, 1.0);
    view /= view.w;
    vec3 dir = normalize((uCamWorld * vec4(view.xyz, 0.0)).xyz);

    vec3 p = uCamPos;
    vec3 v = dir;
    vec3 h = cross(p, v);
    float h2 = dot(h, h);

    vec3 col = vec3(0.0);
    float transmit = 1.0;
    float closest = 1e4;
    bool captured = false;

    for (int i = 0; i < STEPS; i++) {
      float r2 = dot(p, p);
      float r = sqrt(r2);
      closest = min(closest, r);
      if (r < 1.0) { captured = true; break; }
      if (r > 90.0 && dot(p, v) > 0.0) break;

      // Small steps near the hole, big ones far away.
      float dt = clamp(0.06 * r, 0.02, 1.5);
      vec3 prev = p;
      v += -1.5 * h2 * p / (r2 * r2 * r) * dt;
      p += v * dt;

      if (prev.y * p.y < 0.0) {
        vec3 q = mix(prev, p, prev.y / (prev.y - p.y));
        float rq = length(q.xz);
        if (rq > DISK_IN && rq < DISK_OUT) {
          vec4 d = disk(q, rq, normalize(v));
          col += transmit * d.rgb;
          transmit *= 1.0 - d.a;
          if (transmit < 0.02) break;
        }
      }
    }

    if (!captured) {
      col += transmit * background(normalize(v));
      // Thin photon ring from light that skimmed the photon sphere.
      col += transmit * vec3(1.2, 0.75, 0.45) * 0.35 * exp(-(closest - 1.5) * 6.0);
    }

    // Filmic-ish tone map and gamma: the display pass writes this straight to the screen.
    col = 1.0 - exp(-col * 1.05);
    gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
  }
`;

export const displayFragment = /* glsl */ `
  uniform sampler2D tMap;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(tMap, vUv);
  }
`;

// Ambient spiral particles. Orbit them on the GPU with the same angular-speed curve as
// orbits.js, and fade those hidden behind the black hole's shadow, like the project stars.
export const particleVertex = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aHeight;
  attribute float aSize;
  attribute float aBright;
  attribute vec3 aColor;

  uniform float uElapsed;
  uniform float uTime;
  uniform float uOuterOmega;
  uniform float uMaxRadius;
  uniform float uOmegaExponent;
  uniform float uPointScale;
  uniform float uMaxPoint;
  uniform vec3 uCam;

  varying float vAlpha;
  varying vec3 vColor;

  const float SHADOW = ${glslFloat(SHADOW_RADIUS)};

  void main() {
    float omega = uOuterOmega * pow(uMaxRadius / aRadius, uOmegaExponent);
    float a = aAngle + omega * uElapsed;
    vec3 p = vec3(cos(a) * aRadius, aHeight, sin(a) * aRadius);

    vec3 d = p - uCam;
    float t = clamp(-dot(uCam, d) / dot(d, d), 0.0, 1.0);
    float miss = length(uCam + d * t);
    float visible = t > 0.999 ? 1.0 : smoothstep(SHADOW * 0.9, SHADOW * 1.25, miss);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uPointScale / -mv.z, uMaxPoint);

    float twinkle = 0.75 + 0.25 * sin(uTime * 1.3 + aAngle * 37.0);
    vAlpha = aBright * visible * twinkle;
    vColor = aColor;
  }
`;

export const particleFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`;
