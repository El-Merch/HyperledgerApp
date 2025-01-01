import React from "react";
import "./Track_style.css"

const Track = () =>{
    return(
        <div className="Track">
            <header className="Track-header">
                <div className="menu">Menú</div>
                <h1>Ecolistico</h1>
                <div className="user-info">
                    <span>Isabela P.</span>
                </div>
            </header>

            <main>
                <section className="track-content">
                    <h2>Status Orden</h2>
                    <ul>
                        <li>Recibido - 05/Enero/2025</li>
                        <li>Proceso</li>
                        <li>Empaquetado</li>
                        <li>Entregado</li>
                    </ul>
                </section>

                <section className="items-section">
                    <div className="item">
                        <img/>
                        <p>Papa</p>
                    </div>
                    <div className="item">
                        <img/>
                        <p>Lechuga</p>
                    </div>
                </section>
            </main>

            <footer className="track-footer">
                <p>GreenChain 🥬</p>
                <p>Version 1.0 / Ecolistico 2025</p>
            </footer>
        </div>
    );
};

export default Track