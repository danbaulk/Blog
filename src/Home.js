import React from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-multi-carousel';

import fplLogo from './assets/fpl-logo.png';
import pantryThumb from './assets/pantry-planner.png';
import gymbuddyThumb from './assets/gymbuddy-today.png';
import aroundtheworldThumb from './assets/aroundtheworld-map.png';

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
    <main>
      <section className="intro">
        <div className="container">
          <p className="intro-eyebrow">Hi, I'm Dan 👋</p>
          <h1>I build things, and write about them.</h1>
          <p className="intro-lead">
            A home for the projects I'm working on — from machine learning experiments to
            full-stack builds. Have a look around.
          </p>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <h2 className="section-title">My Projects</h2>
          <Carousel
            responsive={responsive}
            autoPlay={true}
            infinite={true}
            keyBoardControl={true}
            itemClass="carousel-item"
          >
            <Link to="/fpl-project" className="project-card">
              <div className="project-card__media">
                <img src={fplLogo} alt="FPL Assistant Manager"/>
              </div>
              <div className="project-card__body">
                <h3>FPL Assistant Manager</h3>
                <p>Machine learning models I trained to predict the highest scoring Fantasy Premier League team for the next gameweek.</p>
                <span className="project-card__cta">Read more →</span>
              </div>
            </Link>

            <Link to="/pantry" className="project-card">
              <div className="project-card__media">
                <img src={pantryThumb} alt="The Pantry"/>
              </div>
              <div className="project-card__body">
                <h3>The Pantry</h3>
                <p>A local-first meal planner that turns your weekly meals into a shopping list that builds itself — combined, scaled and grouped by supermarket aisle.</p>
                <span className="project-card__cta">Read more →</span>
              </div>
            </Link>

            <Link to="/gymbuddy" className="project-card">
              <div className="project-card__media">
                <img src={gymbuddyThumb} alt="GymBuddy"/>
              </div>
              <div className="project-card__body">
                <h3>GymBuddy</h3>
                <p>A local-first gym tracker that round-robins through your routines, remembers every lift, and flags the exercises that have stopped going up.</p>
                <span className="project-card__cta">Read more →</span>
              </div>
            </Link>

            <Link to="/around-the-world" className="project-card">
              <div className="project-card__media">
                <img src={aroundtheworldThumb} alt="Around the World"/>
              </div>
              <div className="project-card__body">
                <h3>Around the World</h3>
                <p>A local-first travel scratch-map: tap the countries you've been to, log dated visits, and watch a passport, badges and challenges build themselves.</p>
                <span className="project-card__cta">Read more →</span>
              </div>
            </Link>
          </Carousel>
        </div>
      </section>
    </main>
  );
}

export default Home;
