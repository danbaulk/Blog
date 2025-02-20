import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-multi-carousel';

import fplLogo from './assets/fpl-logo.png';
import comingSoon from './assets/coming-soon.png';

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

function Home() {
  return (
    <div>
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
            <Link to="/fpl-project">
              <img src={fplLogo} alt="FPL Assistant Manager" className="fpl-logo"/>
              <h3>FPL Assistant Manager</h3>
              <p>Utilise AI Models I trained to predict the highest scoring team for the next gameweek</p>
            </Link>
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

export default Home;