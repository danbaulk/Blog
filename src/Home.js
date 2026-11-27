import React, { Suspense, lazy } from 'react';

import projects from './projects';

// three.js is large, so the galaxy loads in its own chunk and post pages never fetch it.
const Galaxy = lazy(() => import('./galaxy/Galaxy'));

function Home() {
  return (
    <main className="home">
      {/* The scene is the page; the heading is for screen readers and search engines. */}
      <h1 className="visually-hidden">Dan Baulk - projects</h1>

      <Suspense fallback={<div className="galaxy" />}>
        <Galaxy projects={projects} />
      </Suspense>
    </main>
  );
}

export default Home;
