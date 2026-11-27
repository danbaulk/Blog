import React from 'react';

import ProjectCard from './ProjectCard';

/**
 * The projects as a plain grid of cards: what the home page shows when the galaxy can't
 * run (no WebGL, a lost GPU context, or its lazy chunk failing to load). Its styles live
 * in App.css rather than the galaxy chunk, so it still renders when that chunk doesn't.
 */
function ProjectGrid({ projects }) {
  return (
    <div className="project-grid container">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default ProjectGrid;
