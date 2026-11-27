import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ProjectCard from '../ProjectCard';
import ProjectGrid from '../ProjectGrid';
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

  // Size the card from the DOM. Only done when the card or the stage changes size, so the
  // per-frame placement below needs no layout reads.
  const measureCard = useCallback((stage) => {
    const card = cardRef.current;
    if (card) cardSize.current = { width: card.offsetWidth, height: card.offsetHeight, stage };
  }, []);

  // Put the open card beside its star, flipping left near the right edge and clamping to
  // the stage. `screen` and `stage` are the scene's latest projected stars and size.
  const placeCard = useCallback((screen, stage) => {
    const card = cardRef.current;
    const star = screen.find((s) => s.id === activeRef.current);
    if (!card || !star) return;
    const sized = cardSize.current.stage;
    if (!sized || sized.width !== stage.width || sized.height !== stage.height) measureCard(stage);
    const { width: cw, height: ch } = cardSize.current;
    const gap = CARD_GAP + star.radius * 0.5;
    const right = star.x + gap + cw <= stage.width - EDGE;
    const x = right ? star.x + gap : Math.max(EDGE, star.x - gap - cw);
    const y = Math.min(Math.max(EDGE, star.y - ch / 2), Math.max(EDGE, stage.height - ch - EDGE));
    card.style.transform = `translate(${x}px, ${y}px)`;
    card.style.opacity = String(Math.max(star.visible, 0.35));
    card.style.visibility = 'visible';
  }, [measureCard]);

  // Runs every animation frame: move the DOM overlays to follow their stars. Writes go
  // straight to the elements so React doesn't re-render at 60fps.
  const onFrame = useCallback((screen, stage) => {
    for (const s of screen) {
      const label = labelRefs.current[s.id];
      if (!label) continue;
      label.style.transform = `translate(${s.x}px, ${s.y + s.radius * 0.6 + 6}px) translateX(-50%)`;
      label.style.opacity = String(s.visible * (s.id === activeRef.current ? 0 : 0.85));
    }
    placeCard(screen, stage);
  }, [placeCard]);

  useEffect(() => {
    // Falling back unmounts the stage, so this also disposes a scene whose context was lost.
    if (failed) return undefined;
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
  }, [projects, reducedMotion, failed, onFrame]);

  // Highlight the active star, and measure and place a newly opened card before the
  // browser paints, so it never shows for a frame at the stage's top-left corner.
  useLayoutEffect(() => {
    activeRef.current = activeId;
    const scene = sceneRef.current;
    if (!scene) return;
    scene.setHighlighted(activeId);
    if (!cardRef.current) return;
    const stage = { width: scene.width, height: scene.height };
    measureCard(stage);
    placeCard(scene.screen, stage);
  }, [activeId, measureCard, placeCard]);

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

  if (failed) return <ProjectGrid projects={projects} />;

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
        <ProjectCard
          key={active.id}
          ref={cardRef}
          project={active}
          className="galaxy-card"
          style={{ '--star': active.color, visibility: 'hidden' }}
          tabIndex={-1}
          aria-hidden="true"
          onMouseEnter={cancelClear}
          onMouseLeave={scheduleClear}
        />
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
