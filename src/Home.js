import React, { Suspense, lazy } from 'react';

import ErrorBoundary from './ErrorBoundary';
import ProjectGrid from './ProjectGrid';
import projects from './projects';

// three.js is large, so the galaxy loads in its own chunk and post pages never fetch it.
const Galaxy = lazy(() => import('./galaxy/Galaxy'));

function Home() {
  return (
    <main className="home">
      {/* The scene is the page; the heading is for screen readers and search engines. */}
      <h1 className="visually-hidden">Dan Baulk - projects</h1>

      <ErrorBoundary fallback={<ProjectGrid projects={projects} />}>
        <Suspense fallback={<div className="home-loading" />}>
          <Galaxy projects={projects} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

export default Home;
