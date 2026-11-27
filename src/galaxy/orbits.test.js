import {
  DISK_OUTER,
  STAR_MAX_RADIUS,
  STAR_MIN_RADIUS,
  ambientSpiral,
  angularSpeed,
  positionAt,
  spiralLayout,
  visibility,
} from './orbits';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

describe('spiralLayout', () => {
  it('keeps every project star clear of the accretion disk and within bounds', () => {
    for (let count = 1; count <= 12; count++) {
      for (const star of spiralLayout(count)) {
        expect(star.radius).toBeGreaterThan(DISK_OUTER);
        expect(star.radius).toBeGreaterThanOrEqual(STAR_MIN_RADIUS);
        expect(star.radius).toBeLessThanOrEqual(STAR_MAX_RADIUS);
      }
    }
  });

  it('never stacks two stars on top of each other, for 1 to 12 projects', () => {
    for (let count = 2; count <= 12; count++) {
      const positions = spiralLayout(count).map((s) => positionAt(s, 0));
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          expect(distance(positions[i], positions[j])).toBeGreaterThan(1);
        }
      }
    }
  });

  it('places a single project mid-spiral', () => {
    const [star] = spiralLayout(1);
    expect(star.radius).toBeCloseTo((STAR_MIN_RADIUS + STAR_MAX_RADIUS) / 2);
  });
});

describe('positionAt', () => {
  it('keeps a star on its orbit radius as it moves', () => {
    const [star] = spiralLayout(1);
    for (const t of [0, 13, 90, 400]) {
      const p = positionAt(star, t);
      expect(Math.hypot(p.x, p.z)).toBeCloseTo(star.radius);
    }
  });

  it('returns to the same place after one orbital period', () => {
    const star = spiralLayout(5)[4];
    const period = (2 * Math.PI) / angularSpeed(star.radius);
    const start = positionAt(star, 0);
    const later = positionAt(star, period);
    expect(later.x).toBeCloseTo(start.x);
    expect(later.z).toBeCloseTo(start.z);
  });

  it('turns inner stars faster than outer ones', () => {
    expect(angularSpeed(STAR_MIN_RADIUS)).toBeGreaterThan(angularSpeed(STAR_MAX_RADIUS));
  });

  it('turns the outer edge roughly once every three minutes', () => {
    const period = (2 * Math.PI) / angularSpeed(STAR_MAX_RADIUS);
    expect(period).toBeCloseTo(180);
  });
});

describe('ambientSpiral', () => {
  it('is deterministic for a given seed', () => {
    expect(ambientSpiral(200, 7)).toEqual(ambientSpiral(200, 7));
    expect(ambientSpiral(200, 7)).not.toEqual(ambientSpiral(200, 8));
  });

  it('keeps particles off the accretion disk', () => {
    for (const p of ambientSpiral(1500)) {
      expect(p.radius).toBeGreaterThan(DISK_OUTER);
    }
  });
});

describe('visibility', () => {
  const cam = { x: 0, y: 5, z: 30 };

  it('hides a star directly behind the hole', () => {
    expect(visibility(cam, { x: 0, y: -1, z: -6 })).toBe(0);
  });

  it('shows a star in front of the hole', () => {
    expect(visibility(cam, { x: 0, y: 1, z: 8 })).toBe(1);
  });

  it('shows a star behind the hole but well off to the side', () => {
    expect(visibility(cam, { x: 12, y: 0, z: -8 })).toBe(1);
  });
});
