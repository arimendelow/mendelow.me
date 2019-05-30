import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="text-center">
      <header className="bg-blue-900 m-6 p-6 rounded shadow-outline">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-white">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="text-base text-green-300"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
