import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import Bridge from "./Bridge.js";

import { Row, Col } from 'antd';
import { useExchangePrice, useGasPrice } from "./hooks";
import { Header, Account, Provider } from "./components";

import Nftwallet from './NFTWallet.js';
import Escrow from './Escrow.js'
import web3 from 'web3';
import Flow from "./Flow.js";
import Home from "./Home.js";
import FlowUser from "./FlowUser.js";

const mainnetProvider = new ethers.providers.InfuraProvider("mainnet","433699ddb2194574a686098d5596dc4a")
const localProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER?process.env.REACT_APP_PROVIDER:"http://localhost:8545")

function App() {

  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = useExchangePrice(mainnetProvider)
  const gasPrice = useGasPrice("fast")
  const [ethTokens, setEThTokens] = useState([]);

  return (
    <Router>
      <Switch>
        <Route path="/flowdashboard">
           <Home/>
           <Flow/>
           <Bridge
             localProvider={localProvider}
             setInjectedProvider={setInjectedProvider}
           />
        </Route>

        <Route path="/flowuser">
           <Home/>
           <Flow/>
           <FlowUser/>
        </Route>

        <Route path="/ethescrow">
        <div className="App">
          <Home/>
          <Header />
          <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
            <Account
              address={address}
              setAddress={setAddress}
              localProvider={localProvider}
              injectedProvider={injectedProvider}
              setInjectedProvider={setInjectedProvider}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </div>
          <div style={{padding:40,textAlign: "left"}}>
            <Escrow
              localProvider={localProvider}
              injectedProvider={injectedProvider}
              mainnetProvider={mainnetProvider}
            />
          </div>
        </div>
        </Route>

        <Route path="/ethuser">
        <div className="App">
          <Home/>
          <Header />
          <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
            <Account
              address={address}
              setAddress={setAddress}
              localProvider={localProvider}
              injectedProvider={injectedProvider}
              setInjectedProvider={setInjectedProvider}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </div>
          <div style={{padding:40,textAlign: "left"}}>
            <Nftwallet
              address={address}
              setAddress={setAddress}
              localProvider={localProvider}
              injectedProvider={injectedProvider}
              setInjectedProvider={setInjectedProvider}
              mainnetProvider={mainnetProvider}
              price={price}
              ethTokens={ethTokens}
              setEthTokens={setEThTokens}
            />
          </div>
        </div>
        </Route>

        <Route path="/">
          <Home/>
          <h1>ETH↔️FLOW</h1>
        </Route>
      </Switch>
   </Router>


  );
}

export default App;
