import React, { useState, useEffect, useRef } from 'react';
import Dashboard from "./components/Dashboard";
import { formatData } from "./utils";
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
        if (pair.quote_currency === "USD") {
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

  useEffect(() => {
    if (!first.current) {
      console.log("returning on first render");
      return;
    }

    console.log("running pair change");
    let message = {
      type: "subscribe",
      product_ids: [pair],
      channels: ["ticker"]
    };
    let jsonMessage = JSON.stringify(message);
    ws.current.send(jsonMessage);

    let historicalDataURL = `${url}/products/${pair}/candles?granularity=86400`;
    const fetchHistoricalData = async () => {
      let dataArr = [];
      await fetch(historicalDataURL)
        .then((res) => res.json())
        .then((data) => (dataArr = data));
      console.log(dataArr);
      let formattedData = formatData(dataArr);
      setPastData(formattedData);
    };

    fetchHistoricalData();

    ws.current.onmessage = (e) => {
      let data = JSON.parse(e.data);
      if (data.type !== "ticker") {
        console.log("non ticker event", e);
        return;
      }

      if (data.product_id === pair) {
        setPrice(data.price);
      }
    };
  }, [pair]);

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
