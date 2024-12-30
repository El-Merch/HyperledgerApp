import React from 'react';
import './Login_style.css'; // Asegúrate de mover tu archivo de estilos aquí

import ecoLogo from './assets/eco-logo0.png';
import image19 from './assets/image-190.png';
import image12 from './assets/image-120.png';
import image18 from './assets/image-180.png';
import vector from './assets/vector0.svg';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-left">
        <img src={ecoLogo} alt="Logo" className="eco-logo" />
        <h1>Inicia Sesión</h1>
        <form className="login-form">
          <div className="form-group">
            <label>Email address<span>*</span></label>
            <input type="email" placeholder="Example@gmail.com" />
          </div>
          <div className="form-group">
            <label>Password<span>*</span></label>
            <div className="password-container">
              <input type="password" placeholder="*************" />
              <button type="button" className="toggle-password">
                👁️
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
      <div className="login-right">
        <img src={image12} alt="Background" className="background-image" />
      </div>
    </div>
  );
};

export default Login;
