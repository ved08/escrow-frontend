import React from 'react';
import logo from './logo.svg';
import './App.css';
import idl from "./IDL/idl.json"
import WalletContextProvider from './WalletContextProvider';
import Escrow from './components/Escrow';
import Refund from './components/Refund';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <WalletContextProvider>
          <Navbar />
          <Escrow />
          <small>Created by <a href='https://github.com/ved08'>Vedvardhan Gyanmote</a></small>
      </WalletContextProvider>
    </div>
  );
}

export default App;
