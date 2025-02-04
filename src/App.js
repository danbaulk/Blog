import logo from './assets/logo.svg';
import linkedinLogo from './assets/linkedin.png';
import githubLogo from './assets/github.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="banner">
        <div className="banner-title">B(aulk)log</div>
        <div className="banner-links">
          <a href="https://www.linkedin.com/in/danielbaulk/" target="_blank" rel="noopener noreferrer">
            <img src={linkedinLogo} alt="LinkedIn" className="banner-logo" />
          </a>
          <a href="https://github.com/danbaulk" target="_blank" rel="noopener noreferrer">
            <img src={githubLogo} alt="GitHub" className="banner-logo" />
          </a>
        </div>
      </div>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <section className="intro">
          <h2>Welcome to B(aulk)log</h2>
          <p>This is a blog to share the various projects I'm working on. Stay tuned for updates!</p>
        </section>
      </header>
    </div>
  );
}

export default App;
