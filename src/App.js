import React, { useState, useEffect, useRef } from 'react';
import Dashboard from "./components/Dashboard";
import './App.css';

function App() {
  const [ currencies, setCurrencies ] = useState([]);
  const [ pair, setPair ] = useState('');
  const [ price, setPrice ] = useState('0.00');
  const [ pastData, setPastData ] = useState({});
  const ws = useRef(null);

  let first = useRef(false);
  const url = 'https://api.pro.coinbase.com';

  useEffect(() => {
    ws.current = new WebSocket("wss://ws-feed.pro.coinbase.com");

    let pairs = [];

    const apiCall = async () => {
      await fetch(url + "/products")
        .then((res) => res.json())
        .then((data) => (pairs = data));
      console.log("PAIRS: ", pairs);
      let filtered = pairs.filter((pair) => {
        if (pair.quote_currency === "NZD") {
          return pair;
        }
      });

      filtered = filtered.sort((a, b) => {
        if (a.base_currency < b.base_currency) {
          return -1;
        }
        if (a.base_currency > b.base_currency) {
          return 1;
        }
        return 0;
      });

      console.log("FILTERED: ", filtered);
      setCurrencies(filtered);

      first.current = true;
    };

    apiCall();
  }, []);

  return (
    <div>
      <header>
        <p>Hello world</p>
        <Dashboard></Dashboard>
      </header>
    </div>
  );
}

export default App;
