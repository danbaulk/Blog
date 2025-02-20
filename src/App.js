import React from 'react';
import Carousel from 'react-multi-carousel';

import linkedinLogo from './assets/linkedin.png';
import githubLogo from './assets/github.png';
import fplLogo from './assets/fpl-logo.png';
import comingSoon from './assets/coming-soon.png';
import baulkLogo from './assets/logo.jpeg'; 

import './App.css';
import 'react-multi-carousel/lib/styles.css';

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

function App() {
  return (
    <div className="App">
      <div className="banner">
        <img src={baulkLogo} alt="Baulk Logo" className="banner-logo"/>
        <div className="banner-links">
          <a href="https://www.linkedin.com/in/danielbaulk/" target="_blank" rel="noopener noreferrer">
            <img src={linkedinLogo} alt="LinkedIn" className="banner-link"/>
          </a>
          <a href="https://github.com/danbaulk" target="_blank" rel="noopener noreferrer">
            <img src={githubLogo} alt="GitHub" className="banner-link"/>
          </a>
        </div>
      </div>
      <header className="App-header">
        <section className="intro">
          <h2>Welcome!</h2>
          <p>This is a blog to share the various projects I'm working on. Stay tuned for updates!</p>
        </section>
      </header>
      <section className="carousel-section">
        <h2>My Projects</h2>
        <Carousel responsive={responsive} autoPlay={true} infinite={true}>
          <div className="carousel-item">
            <a href="https://github.com/danbaulk/FPL-AI?tab=readme-ov-file#fpl-ai" target="_blank" rel="noopener noreferrer">
              <img src={fplLogo} alt="FPL Assitant Manager" className="fpl-logo"/>
              <h3>FPL Assitant Manager</h3>
              <p>This project extended the work I did for my
                Final Year Project in University, I've trained multiple ANN models on a large historic FPL dataset
                and created a backend golang API which interacts with the offical FPL API to get the latest data
                and predict the highest scoring team for the upcoming gameweek.</p>
            </a>
          </div>
          <div className="carousel-item">
            <img src={comingSoon} alt="Blog Post 2" className="comingsoon-logo"/>
            <h3>Blog Post 2</h3>
            <p>Coming Soon</p>
          </div>
          <div className="carousel-item">
            <img src={comingSoon} alt="Blog Post 3" className="comingsoon-logo"/>
            <h3>Blog Post 3</h3>
            <p>Coming Soon</p>
          </div>
        </Carousel>
      </section>
    </div>
  );
}

export default App;
