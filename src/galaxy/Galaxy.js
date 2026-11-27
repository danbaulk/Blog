import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import GalaxyScene from './GalaxyScene';
import './galaxy.css';

const CARD_GAP = 22;
const EDGE = 12;
// Grace period for the mouse to travel from a star onto its card.
const CLEAR_DELAY = 250;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/**
 * The home-page galaxy: a black hole with one star per project spiralling around it.
 * Falls back to a plain grid of project cards when WebGL isn't available.
 */
function Galaxy({ projects }) {
  const navigate = useNavigate();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const touchFirst = useMediaQuery('(hover: none)');

  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const labelRefs = useRef({});
  const cardRef = useRef(null);
  const cardSize = useRef({ width: 0, height: 0 });
  const activeRef = useRef(null);
  const clearTimer = useRef(null);
  const pointerType = useRef('mouse');

  const [activeId, setActiveId] = useState(null);
  const [failed, setFailed] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  const active = projects.find((p) => p.id === activeId) || null;

  // Runs every animation frame: move the DOM overlays to follow their stars. Writes go
  // straight to the elements so React doesn't re-render at 60fps.
  const onFrame = useCallback((screen, { width, height }) => {
    for (const s of screen) {
      const label = labelRefs.current[s.id];
      if (!label) continue;
      label.style.transform = `translate(${s.x}px, ${s.y + s.radius * 0.6 + 6}px) translateX(-50%)`;
      label.style.opacity = String(s.visible * (s.id === activeRef.current ? 0 : 0.85));
    }

    const card = cardRef.current;
    const star = screen.find((s) => s.id === activeRef.current);
    if (!card || !star) return;
    const { width: cw, height: ch } = cardSize.current;
    const gap = CARD_GAP + star.radius * 0.5;
    const right = star.x + gap + cw <= width - EDGE;
    const x = right ? star.x + gap : Math.max(EDGE, star.x - gap - cw);
    const y = Math.min(Math.max(EDGE, star.y - ch / 2), Math.max(EDGE, height - ch - EDGE));
    card.style.transform = `translate(${x}px, ${y}px)`;
    card.style.opacity = String(Math.max(star.visible, 0.35));
  }, []);

  useEffect(() => {
    let scene;
    try {
      scene = new GalaxyScene(stageRef.current, projects, {
        reducedMotion,
        onFrame,
        onContextLost: () => setFailed(true),
      });
    } catch (error) {
      setFailed(true);
      return undefined;
    }
    scene.setHighlighted(activeRef.current);
    scene.start();
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [projects, reducedMotion, onFrame]);

  useEffect(() => {
    activeRef.current = activeId;
    if (sceneRef.current) sceneRef.current.setHighlighted(activeId);
  }, [activeId]);

  // Measure the card once per project so the per-frame placement needs no layout reads.
  useLayoutEffect(() => {
    if (cardRef.current) {
      cardSize.current = { width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight };
    }
  }, [activeId]);

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const cancelClear = () => clearTimeout(clearTimer.current);
  const scheduleClear = () => {
    cancelClear();
    clearTimer.current = setTimeout(() => setActiveId(null), CLEAR_DELAY);
  };

  const localPoint = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, rect };
  };

  const handlePointerMove = (event) => {
    const scene = sceneRef.current;
    if (!scene) return;
    pointerType.current = event.pointerType;
    const { x, y, rect } = localPoint(event);
    scene.setPointer((x / rect.width) * 2 - 1, (y / rect.height) * 2 - 1);
    if (event.pointerType !== 'mouse') return;

    const id = scene.pick(x, y);
    stageRef.current.style.cursor = id ? 'pointer' : '';
    if (id) {
      cancelClear();
      setActiveId(id);
      setHintVisible(false);
    } else if (activeRef.current) {
      scheduleClear();
    }
  };

  const handlePointerLeave = () => {
    if (sceneRef.current) sceneRef.current.setPointer(0, 0);
    if (pointerType.current === 'mouse') scheduleClear();
  };

  const handleClick = (event) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const { x, y } = localPoint(event);
    const id = scene.pick(x, y);
    setHintVisible(false);
    if (pointerType.current === 'mouse') {
      const project = projects.find((p) => p.id === id);
      if (project) navigate(project.route);
      return;
    }
    // Touch: the first tap opens the card, the card itself is the link.
    cancelClear();
    setActiveId(id);
  };

  if (failed) {
    return (
      <div className="galaxy-fallback container">
        {projects.map((project) => (
          <Link key={project.id} to={project.route} className="project-card">
            <div className="project-card__media">
              <img src={project.thumb} alt="" />
            </div>
            <div className="project-card__body">
              <h3>{project.title}</h3>
              <p>{project.blurb}</p>
              <span className="project-card__cta">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="galaxy">
      <div
        ref={stageRef}
        className="galaxy-stage"
        onPointerDown={(e) => { pointerType.current = e.pointerType; }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        aria-hidden="true"
      />

      <div className="galaxy-labels" aria-hidden="true">
        {projects.map((project) => (
          <span
            key={project.id}
            ref={(el) => { labelRefs.current[project.id] = el; }}
            className="galaxy-label"
          >
            {project.title}
          </span>
        ))}
      </div>

      {active && (
        <Link
          ref={cardRef}
          to={active.route}
          className="project-card galaxy-card"
          style={{ '--star': active.color }}
          tabIndex={-1}
          aria-hidden="true"
          onMouseEnter={cancelClear}
          onMouseLeave={scheduleClear}
        >
          <div className="project-card__media">
            <img src={active.thumb} alt="" />
          </div>
          <div className="project-card__body">
            <h3>{active.title}</h3>
            <p>{active.blurb}</p>
            <span className="project-card__cta">Read more →</span>
          </div>
        </Link>
      )}

      <p className={`galaxy-hint${hintVisible ? '' : ' galaxy-hint--hidden'}`} aria-hidden="true">
        {touchFirst ? 'Tap a star to explore' : 'Hover a star to explore'}
      </p>

      <nav className="galaxy-nav" aria-label="Projects">
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                to={project.route}
                onFocus={() => { cancelClear(); setActiveId(project.id); }}
                onBlur={() => setActiveId(null)}
              >
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Galaxy;
