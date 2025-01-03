import React from "react";
import Swal from "sweetalert2";
import "./Track_style.css";
import logo from './assets/ecolistico_logo_sin_fondo.png';

const Track = () => {
  // Maneja el evento de clic en un item-card
  const handleItemClick = (itemName) => {
    Swal.fire({
      title: `Detalles de ${itemName}`,
      text: `Aquí podrías mostrar información adicional sobre ${itemName}.`,
      icon: "info",
      confirmButtonText: "Cerrar",
    });
  };

  return (
    <div className="track-container">
      {/* Header */}
      <header className="track-header">
        <div className="menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="#27ae60" d="M2 6a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m0 6.032a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m1 5.033a1 1 0 1 0 0 2h18a1 1 0 0 0 0-2z"/></svg>
          <div className="menu-text">Menú</div>
        </div>
        <img src={logo} alt="Ecolistico" className="logo"/> 
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
          <div
            className="item-card"
            onClick={() => handleItemClick("Papa")}
          >
            <img src="/assets/potato.png" alt="Papa" className="item-image" />
            <p className="item-name">Papa</p>
          </div>
          <div
            className="item-card"
            onClick={() => handleItemClick("Lechuga")}
          >
            <img src="/assets/lettuce.png" alt="Lechuga" className="item-image" />
            <p className="item-name">Lechuga</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="track-footer">
        <p className="p-footer-title">GreenChain 🥬</p>
        <p className="p-footer">Versión 1.0 / Ecolistico 2025</p>
        <p className="p-footer">Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Track;
