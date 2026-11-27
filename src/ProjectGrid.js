import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The projects as a plain grid of cards: what the home page shows when the galaxy can't
 * run (no WebGL, a lost GPU context, or its lazy chunk failing to load). Its styles live
 * in App.css rather than the galaxy chunk, so it still renders when that chunk doesn't.
 */
function ProjectGrid({ projects }) {
  return (
    <div className="project-grid container">
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

export default ProjectGrid;
