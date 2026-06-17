import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import baulkLogo from './assets/logo.jpeg';

import './App.css';
import 'react-multi-carousel/lib/styles.css';

import Home from './Home';
import FPLProject from './blogs/FPLProject';
import PantryProject from './blogs/PantryProject';
import GymBuddyProject from './blogs/GymBuddyProject';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="banner">
          <div className="banner-inner">
            <Link to="/" className="banner-brand" aria-label="Dan Baulk — home">
              <img src={baulkLogo} alt="Dan Baulk" className="banner-logo"/>
            </Link>
            <nav className="banner-links">
              <a
                href="https://www.linkedin.com/in/danielbaulk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="banner-link"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.53C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.73C24 .77 23.2 0 22.22 0z"/>
                </svg>
              </a>
              <a
                href="https://github.com/danbaulk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="banner-link"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.78.11 3.08.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/>
                </svg>
              </a>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fpl-project" element={<FPLProject />} />
          <Route path="/pantry" element={<PantryProject />} />
          <Route path="/gymbuddy" element={<GymBuddyProject />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
