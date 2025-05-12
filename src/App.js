import logo from './logo.svg'; // Here I import the logo image for the app
import './App.css'; // Here I import the CSS file to style the app

function App() {
  return (
    <div className="App">
      {/* Here I create the main container div for the app */}
      <header className="App-header">
        {/* Here I define the header section of the app */}
        <img src={logo} className="App-logo" alt="logo" />
        {/* Here I add the logo image */}
        <p>
          {/* Here I add text instructing the user to edit the code */}
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {/* Here I style the link using App-link class and set destination */}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Here I add the text for the link */}
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App; // Here I export the App component for use elsewhere
