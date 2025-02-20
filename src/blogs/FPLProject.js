import React from 'react';

import fplLogo from '../assets/fpl-logo.png';

import './blogs.css';


function FPLProject() {
  return (
    <div className="blog-post">
      <img src={fplLogo} alt="FPL Assistant Manager" className="fpl-logo"/>
      <h1>FPL Assistant Manager</h1>
      <a href="https://github.com/danbaulk/FPL-AI" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
      <p>This project extended the work I did for my Final Year Project in University, I've trained multiple ANN models on a large historic FPL dataset and 
        created a backend golang API which interacts with the offical FPL API to get the latest data and predict the highest scoring team for the upcoming gameweek.</p>
    </div>
  );
}

export default FPLProject;