import React from 'react';
import { Link } from 'react-router-dom';

/**
 * One project as a card linking to its post. Used by the fallback grid and by the
 * galaxy's hover card; any other props (ref, style, handlers) pass through to the link.
 */
function ProjectCard({ project, className = '', ...linkProps }) {
  return (
    <Link to={project.route} className={`project-card ${className}`.trim()} {...linkProps}>
      <div className="project-card__media">
        <img src={project.thumb} alt="" />
      </div>
      <div className="project-card__body">
        <h3>{project.title}</h3>
        <p>{project.blurb}</p>
        <span className="project-card__cta">Read more →</span>
      </div>
    </Link>
  );
}

export default ProjectCard;
