import React, {useState} from 'react';
import './Login_style.css';

import ecoLogo from './assets/eco-logo0.png';
import image19 from './assets/image-190.png';
import image12 from './assets/image-120.png';
import image18 from './assets/image-180.png';
import vector from './assets/vector0.svg';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Para mensajes de error

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Mensaje de éxito
        // Redirige al Dashboard
        window.location.href = '/Track';
      } else {
        const error = await response.json();
        setErrorMessage(error.message); // Muestra el error recibido del backend
      }
    } catch (error) {
      setErrorMessage('Error al conectarse al servidor. Intenta nuevamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={ecoLogo} alt="Logo" className="eco-logo" />
        <h1>Inicia Sesión</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email address<span>*</span></label>
            <input
              type="email"
              placeholder="Example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Actualiza el estado del email
            />
          </div>
          <div className="form-group">
            <label>Password<span>*</span></label>
            <div className="password-container">
              <input
                type="password"
                placeholder="*************"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Actualiza el estado del password
              />
              <button type="button" className="toggle-password">
                👁️
              </button>
            </div>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
      <div className="login-right">
        <img src={image12} alt="Background" className="background-image" />
      </div>
    </div>
  );
};

export default Login;
