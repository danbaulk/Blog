// Pure orbital maths for the home-page galaxy. No three.js, no DOM.
// Units are black-hole units: the event horizon has radius 1 and the accretion disk
// runs from DISK_INNER to DISK_OUTER in the y = 0 plane.

export const DISK_INNER = 3;
export const DISK_OUTER = 8;

// Apparent radius of the black hole's shadow (about 2.6x the horizon for a
// Schwarzschild hole): anything behind it, inside this, is hidden.
export const SHADOW_RADIUS = 2.6;

export const STAR_MIN_RADIUS = 10.5;
export const STAR_MAX_RADIUS = 18;

const ARMS = 2;
// How tightly the arms wind: angle grows by this many radians per unit of ln(r).
const WIND = 2.2;

// Angular speed (rad/s) at the outer star radius: one full turn in ~3 minutes.
export const OUTER_OMEGA = (2 * Math.PI) / 180;
// Softened Kepler fall-off. Pure Kepler (r^-1.5) would shear the spiral apart in
// seconds; this keeps a visible inner-faster winding without destroying the arms.
export const OMEGA_EXPONENT = 0.6;

const BOB_AMPLITUDE = 0.25;

/** Angular speed at radius r, in rad/s, at speed multiplier 1. */
export function angularSpeed(r) {
  return OUTER_OMEGA * Math.pow(STAR_MAX_RADIUS / r, OMEGA_EXPONENT);
}

/** Angle of the spiral arm `arm` at radius r (log spiral). */
function armAngle(arm, r) {
  return (arm * 2 * Math.PI) / ARMS + WIND * Math.log(r / STAR_MIN_RADIUS);
}

/**
 * Places `count` project stars along the spiral arms, alternating arms and spread
 * evenly in radius between STAR_MIN_RADIUS and STAR_MAX_RADIUS.
 * Returns [{ radius, angle, phase }] where angle is the angle at t = 0.
 */
export function spiralLayout(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const f = count === 1 ? 0.5 : i / (count - 1);
    const radius = STAR_MIN_RADIUS + f * (STAR_MAX_RADIUS - STAR_MIN_RADIUS);
    const arm = i % ARMS;
    stars.push({ radius, angle: armAngle(arm, radius), phase: i * 1.7 });
  }
  return stars;
}

/**
 * Position of a laid-out star after `elapsed` seconds of orbit.
 * `elapsed` is orbital time (already scaled by any speed multiplier), so the caller
 * can slow the spiral down smoothly by integrating its own clock.
 * Returns { x, y, z } with y the small vertical bob out of the disk plane.
 */
export function positionAt(star, elapsed) {
  const angle = star.angle + angularSpeed(star.radius) * elapsed;
  return {
    x: Math.cos(angle) * star.radius,
    y: Math.sin(elapsed * 0.4 + star.phase) * BOB_AMPLITUDE,
    z: Math.sin(angle) * star.radius,
  };
}

/** Small deterministic PRNG (mulberry32) so the ambient spiral is the same every load. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * `n` background particles tracing the same arms, scattered around them, from just
 * outside the disk out past the outermost project star.
 * Returns [{ radius, angle, height, size, brightness }]: angles at t = 0.
 */
export function ambientSpiral(n, seed = 1) {
  const rand = seededRandom(seed);
  const minR = DISK_OUTER * 1.1;
  const maxR = STAR_MAX_RADIUS * 1.45;
  const particles = [];
  for (let i = 0; i < n; i++) {
    // Bias towards the inner part so the arms look dense near the disk.
    const radius = minR + Math.pow(rand(), 1.4) * (maxR - minR);
    const arm = i % ARMS;
    // Scatter widens with radius, like a real arm fraying at the edges.
    const spread = 0.25 + 0.35 * ((radius - minR) / (maxR - minR));
    const offset = (rand() + rand() + rand() - 1.5) * spread;
    particles.push({
      radius,
      angle: armAngle(arm, radius) + offset,
      height: (rand() - 0.5) * 0.6,
      size: 0.4 + rand() * 1.1,
      brightness: 0.35 + rand() * 0.65,
    });
  }
  return particles;
}

/**
 * How visible a point p is from the camera at cam, given the black hole's shadow at the
 * origin: 1 when nothing is in the way, falling to 0 when the line of sight passes
 * through the shadow on its way to a point behind the hole.
 */
export function visibility(cam, p) {
  const dx = p.x - cam.x;
  const dy = p.y - cam.y;
  const dz = p.z - cam.z;
  const lengthSq = dx * dx + dy * dy + dz * dz;
  // Fraction along cam -> p of the point closest to the hole.
  const t = -(cam.x * dx + cam.y * dy + cam.z * dz) / lengthSq;
  if (t >= 0.999) return 1; // the hole is behind the point, not in front of it
  const c = Math.max(0, t);
  const miss = Math.hypot(cam.x + dx * c, cam.y + dy * c, cam.z + dz * c);
  return smoothstep(SHADOW_RADIUS * 0.9, SHADOW_RADIUS * 1.25, miss);
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
