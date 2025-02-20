import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import linkedinLogo from './assets/linkedin.png';
import githubLogo from './assets/github.png';
import baulkLogo from './assets/logo.jpeg'; 

import './App.css';
import 'react-multi-carousel/lib/styles.css';

import Home from './Home';
import FPLProject from './blogs/FPLProject';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="banner">
          <Link to="/">
            <img src={baulkLogo} alt="Baulk Logo" className="banner-logo"/>
          </Link>
          <div className="banner-links">
            <a href="https://www.linkedin.com/in/danielbaulk/" target="_blank" rel="noopener noreferrer">
              <img src={linkedinLogo} alt="LinkedIn" className="banner-link"/>
            </a>
            <a href="https://github.com/danbaulk" target="_blank" rel="noopener noreferrer">
              <img src={githubLogo} alt="GitHub" className="banner-link"/>
            </a>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fpl-project" element={<FPLProject />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;