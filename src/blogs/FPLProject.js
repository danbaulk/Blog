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

      <h2>Intro</h2>
      <p>
        This project grew out of my Final Year Project at University. The idea is simple to state and
        surprisingly hard to do well: each gameweek, automatically pick the Fantasy Premier League squad
        that should score the most points. To get there I trained a set of machine learning models on a
        large historic FPL dataset, wired them up behind a Golang backend that pulls live data from the
        official FPL API, and put a React frontend on top that shows you the recommended team for the
        upcoming gameweek at the click of a button.
      </p>
      <p>
        It's a small distributed system, with a data pipeline, an inference service, a constraint solver, 
        and a database all working together.
      </p>

      <img src={ui} alt="UI" className="ui"/>

      <h2>Getting the Data</h2>
      <p>
        The first problem is data. The official FPL API is great for the <em>current</em> state of the
        game — player prices, form, fixtures, expected stats — but it doesn't expose the historical,
        gameweek-by-gameweek record you need to train a model. Fortunately, Vaastav Anand has been
        maintaining a fantastic open dataset on
        GitHub: <a href="https://github.com/vaastav/Fantasy-Premier-League" target="_blank" rel="noopener noreferrer"> FPL Data Repo</a>,
        which captures per-player, per-gameweek data for every season since 2016‑17.
      </p>
      <p>
        From that raw data I engineered the features the models actually learn from. Rather than the raw
        points total, each training row describes the context a player was in: their expected goals,
        assists and goals conceded (xG, xA, xGC), the FPL <em>influence</em>, <em>creativity</em> and
        <em> threat</em> metrics and the combined ICT index, recent form, the difficulty of the upcoming
        fixture, and whether they're playing at home or away. That same set of features is later computed
        live from the FPL API so the models can score players for the gameweek ahead.
      </p>

      <h2>The Models</h2>
      <p>
        I used <a href="https://www.cs.waikato.ac.nz/ml/weka/" target="_blank" rel="noopener noreferrer">Weka</a> to
        both preprocess the data and train the classifiers. Instead of one model trying to do everything, I
        trained a separate model per position, because what makes a goalkeeper score well is very different
        from what makes a forward score well. After comparing a number of algorithms, the best performers
        turned out to be Bayesian: a Naïve Bayes classifier for goalkeepers, and Bayesian Networks for
        defenders, midfielders and forwards.
      </p>
      <p>
        Each model is framed as a simple binary classification — will this player produce a "return"
        (a high-scoring gameweek) or not? The points threshold that counts as a return differs by position,
        since a defender keeping a clean sheet and a forward bagging a brace earn points very differently.
        Crucially, the models don't just output yes/no; they output a <em>confidence</em> in that prediction,
        and that confidence is what the team selector goes on to optimise.
      </p>

      <img src={weka} alt="Weka" className="weka"/>

      <h2>Picking the Team</h2>
      <p>
        Predicting individual players is only half the battle. FPL doesn't let you just buy the eleven most
        promising players — you have to assemble a legal 15-man squad. That makes team selection a
        constrained optimisation problem: maximise the total predicted-return confidence of your squad,
        subject to a strict set of rules. You have a £100m budget, exactly 2 goalkeepers, 5 defenders,
        5 midfielders and 3 forwards, no more than 3 players from any single club, and a starting eleven
        that forms a valid formation (1 GK, at least 3 defenders, at least 3 midfielders, at least 1 forward).
      </p>
      <p>
        This is a variant of the <strong>multi-dimensional knapsack problem</strong>, and the Go backend
        solves it with a greedy heuristic. It sorts every candidate by model confidence, then makes three
        simultaneous greedy passes — one for budget, one for the remaining position slots, and one for the
        per-club limit — and picks the players that satisfy all three constraints at once. When the greedy
        approach paints itself into a corner and can't make a legal pick, it backtracks: it randomly drops a
        player from the squad, frees up their budget, slot and club allowance, and tries again. It keeps
        going until a full, valid 15-man squad is assembled.
      </p>
      <p>
        There's one nice piece of football-specific domain handling here too. In "double" and "triple"
        gameweeks a team plays more than once, so a single player can have multiple fixtures. The selector
        sums a player's confidence across all of their fixtures in that gameweek before optimising, which
        naturally biases the squad towards players with extra opportunities to score — exactly what an
        experienced FPL manager would do.
      </p>

      <h2>The Tech Stack</h2>
      <p>
        Under the hood this is four cooperating services rather than a single app, each picked for the job
        it's best at:
      </p>
      <ul>
        <li><strong>React frontend</strong> — displays the recommended squad on a pitch and lets you trigger a refresh for the upcoming gameweek.</li>
        <li><strong>Golang backend API</strong> — the orchestrator. It talks to the official FPL API, drives the data pipeline, calls the prediction service and runs the team selector.</li>
        <li><strong>Java / Spring Boot service</strong> — wraps the trained Weka models behind an HTTP interface, converting incoming data to Weka's ARFF format and returning predictions with confidence scores.</li>
        <li><strong>MySQL database</strong> — stores the up-to-date FPL data and the predictions generated for each gameweek.</li>
      </ul>
      <p>
        The flow ties them together into a pipeline: the Go service fetches the latest gameweek data and
        stores it, asks the Java service to score every player (one call per position), writes those
        predictions back to the database, and finally runs the knapsack selector over them to build the
        team. The whole thing is containerised with Docker and runs on a GCP virtual machine.
      </p>

      <img src={architecture} alt="Architecture" className="architecture"/>

      <h2>How to Run the Project</h2>
      <p>
        To run it yourself you'll need Docker and MySQL installed on the host machine. Clone the FPL repos
        from my
        GitHub: <a href="https://github.com/danbaulk/" target="_blank" rel="noopener noreferrer">GitHub Repository</a> and
        follow the README in each repo to build the local images. The last step is to wire the services
        together with a docker-compose file so the frontend, Go API, Java predictor and database all start
        up and talk to one another.
      </p>

      <h2>The Future</h2>
      <p>
        This was a brilliant project for experimenting with a stack of different technologies and learning
        how to integrate them into one coherent system. There's plenty I'd still like to do: improving the
        accuracy of the models (and revisiting the feature engineering and algorithm choices behind them),
        adding more features to the frontend, and giving the whole thing a proper visual polish.
      </p>
    </div>
  );
}

export default FPLProject;
