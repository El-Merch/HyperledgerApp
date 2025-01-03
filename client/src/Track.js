import React from "react";
import "./Track_style.css";

const Track = () => {
  return (
    <div className="track-container">
      {/* Header */}
      <header className="track-header">
        <div className="menu">Menú</div>
        <h1 className="title">Ecolistico</h1>
        <div className="user-info">
          <span>Isabela P.</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="track-content">
        {/* Status Section */}
        <section className="status-section">
          <h2>Status Orden</h2>
          <ul className="timeline">
            <li>
              <div className="circle"></div>
              <span>Recibido</span>
            </li>
            <li>
              <div className="circle"></div>
              <span>Proceso</span>
            </li>
            <li>
              <div className="circle"></div>
              <span>Empaquetado</span>
            </li>
            <li>
              <div className="circle"></div>
              <span>Entregado</span>
            </li>
          </ul>
        </section>

        {/* Items Section */}
        <section className="items-section">
          <div className="item-card">
            <img src="/assets/potato.png" alt="Papa" className="item-image" />
            <p className="item-name">Papa</p>
          </div>
          <div className="item-card">
            <img src="/assets/lettuce.png" alt="Lechuga" className="item-image" />
            <p className="item-name">Lechuga</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="track-footer">
        <p>GreenChain 🥬</p>
        <p>Versión 1.0 / Ecolistico 2025</p>
      </footer>
    </div>
  );
};

export default Track;
