import React from "react";
import logo from "../../logo.svg";
import "./App.css";
import { generateCardNumber } from "../../services/NumberGenerator";
import { Visa } from "../../services/Issuers/Visa";

function App() {
  const visa = new Visa();
  const number = generateCardNumber(visa);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <select id="cc_issuer">
            <option value="amex">American Express</option>
            <option value="discover">Discover</option>
            <option value="mastercard">Mastercard</option>
            <option value="visa">Visa</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <p>{number}</p>
        <a
          className="App-link"
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
