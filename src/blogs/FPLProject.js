import React from 'react';

import fplLogo from '../assets/fpl-logo.png';
import architecture from '../assets/architecture.jpg';
import weka from '../assets/weka.jpg';
import ui from '../assets/ui.png';

import './blogs.css';

function FPLProject() {
  return (
    <div className="blog-post">
      <img src={fplLogo} alt="FPL Assistant Manager" className="fpl-logo"/>
      <h1>FPL Assistant Manager</h1>
      <a href="https://github.com/danbaulk/" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
      <p>
        <h2>Intro</h2>
        This project extended the work I did for my Final Year Project in University, I've trained multiple ANN models on a large 
        historic FPL dataset and created a backend golang API which interacts with the offical FPL API to get the latest data and predict 
        the highest scoring team for the upcoming gameweek.

        <img src={ui} alt="UI" className="ui"/>

        <h2>The AI Models</h2>
        Unfortunately, the FPL do not provide the historical data for each gameweek, they do however provide APIs to allow developers to
        access the current gameweek data programmatically. Vaastav Anand has been maintaining an FPL library on
        GitHub: <a href="https://github.com/vaastav/Fantasy-Premier-League" target="_blank" rel="noopener noreferrer"> FPL Data Repo</a> using
        the FPL APIs and he has managed to store and provide publicly the historical gameweek specific data for each player and
        season since the 2016-17 season.
        <br/><br/>

        <img src={weka} alt="Weka" className="weka"/>

        Weka was used to both preprocess the data and train the machine learning models. Four ANN models were trained - one for each position.
        The job of the classifier is simplified to a binary classification, in that it only needs to predict whether a player would score a 
        high number of points, also known as a "return". The threshold for what constitutes a "return" is different for each model as the points
        typically scored by each position are different.
        
        <h2>The Tech Stack</h2>
        This project utilises a number of different technologies:

        <ul>
          <li>React JS Frontend App - for displaying the predicted highest scoring team for the upcoming gameweek</li>
          <li>Golang Backend API - provides endpoints for running the data pipeline and getting the predicted highest scoring team for the
            upcoming gameweek</li>
          <li>Java Backend API - for running the Weka models</li>
          <li>MySQL Database - for storing the up to date FPL data, and the predictions made by the models for each gameweek</li>
          <li>GCP VM - for running the project</li>
        </ul>

        <img src={architecture} alt="Architecture" className="architecture"/>
        
        <h2>How to Run the Project</h2>
        In order to run this project, you will need to complete a few prerequisites. Firstly, you will need Docker and MySQL installed on the
        machine you want to run the project on. Next, clone the FPL repos from my
        GitHub: <a href="https://github.com/danbaulk/" target="_blank" rel="noopener noreferrer">GitHub Repository</a> and follow the 
        instructions in the README.md files in each of the repos on how to build some local images.

        The final step to get the components running together is to create a docker-compose file.

        <h2>The Future</h2>
        This was a great project for experimenting with different technologies and learning how to integrate them together. I would like to
        continue to work on this project and improve the accuracy of the models. I would also like to add more features to the frontend app
        and improve upon the styling of it.
      </p>
    </div>
  );
}

export default FPLProject;