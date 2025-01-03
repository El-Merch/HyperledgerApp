import React, { useState } from "react";
import Swal from "sweetalert2";
import "./Track_style.css";
import logo from './assets/ecolistico_logo_sin_fondo.png';

const Track = () => {
  const [loading, setLoading] = useState(false);

  const handleItemClick = async (itemName) => {
    setLoading(true);
    try {
      // Llamar al servidor para obtener los datos del trayecto
      const response = await fetch(
        `http://localhost:5000/api/food-track/${itemName}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los datos del trayecto");
      }

      const data = await response.json();

      // Crear el contenido de la línea de tiempo
      const productionTimeline = data.productionStats.map((stat, index) => `
        <div class="timeline-item">
          <h4>Producción - Etapa ${index + 1}</h4>
          <p><strong>Fecha:</strong> ${new Date(stat.datalogger_date).toLocaleString()}</p>
          <p><strong>Valor del sensor:</strong> ${stat.datalogger_value}</p>
          <p><strong>Intensidad de luz:</strong> ${stat.led_intensity} lux</p>
          <p><strong>Temperatura:</strong> ${stat.env_temp} °C</p>
          <p><strong>Humedad:</strong> ${stat.env_hum} %</p>
          <p><strong>CO2:</strong> ${stat.env_co2} ppm</p>
          <p><strong>Presión:</strong> ${stat.env_pressure} hPa</p>
        </div>
      `).join("");

      const transportTimeline = data.transportConditions.map((condition, index) => `
        <div class="timeline-item">
          <h4>Transporte - Punto ${index + 1}</h4>
          <p><strong>Fecha y hora:</strong> ${new Date(condition.time_condition).toLocaleString()}</p>
          <p><strong>Ubicación:</strong> ${condition.location}</p>
          <p><strong>Temperatura:</strong> ${condition.temp} °C</p>
          <p><strong>Humedad:</strong> ${condition.hum} %</p>
        </div>
      `).join("");

      const timelineContent = `
        <h3>Producción</h3>
        ${productionTimeline}

        <h3>Transporte</h3>
        ${transportTimeline}
      `;

      // Mostrar los datos en un popup
      Swal.fire({
        title: `Línea de Tiempo de ${itemName}`,
        html: timelineContent,
        icon: "info",
        confirmButtonText: "Cerrar",
        width: "80%",
        customClass: {
          popup: "track-popup",
        },
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo obtener el trayecto del alimento.",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-container">
      <header className="track-header">
        <div className="menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
          >
            <path
              fill="#27ae60"
              d="M2 6a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1m0 6.032a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 1 1-1-1m1 5.033a1 1 0 1 0 0 2h18a1 1 0 0 0 0-2z"
            />
          </svg>
          <div className="menu-text">Menú</div>
        </div>
        <img src={logo} alt="Ecolistico" className="logo"/> 
        <div className="user-info">
          <span>Isabela P.</span>
        </div>
      </header>

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
        
        <section className="items-section">
          <div className="item-card" onClick={() => handleItemClick("Papa")}>
            <img src="/assets/potato.png" alt="Papa" className="item-image" />
            <p className="item-name">Papa</p>
          </div>
          <div className="item-card" onClick={() => handleItemClick("Lechuga")}>
            <img
              src="/assets/lettuce.png"
              alt="Lechuga"
              className="item-image"
            />
            <p className="item-name">Lechuga</p>
          </div>
        </section>
      </main>

      <footer className="track-footer">
        <p className="p-footer-title">GreenChain 🥬</p>
        <p className="p-footer">Versión 1.0 / Ecolistico 2025</p>
        <p className="p-footer">Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Track;
