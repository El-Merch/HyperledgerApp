import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Login from './Login'
import Track from "./Track"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta para el login */}
          <Route path="/" element={<Login />} />

          {/* Ruta para el dashboard */}
          <Route path="/Track" element={<Track />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
