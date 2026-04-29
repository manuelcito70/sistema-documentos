import React, { useState } from 'react';
import { login, register } from '../services/auth';
import './AuthPage.css';

function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    correo: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    nombre: '',
    tipoUsuario: 'interno',
    cargo: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleTipoUsuario = (tipo) => {
    setRegisterData({
      ...registerData,
      tipoUsuario: tipo
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!loginData.correo || !loginData.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      // Llamada real a la API
      // Nota: El backend espera 'username', pero el form usa 'correo'
      // Ajustamos aquí o en el backend. Asumiremos username = correo por simplicidad
      const response = await login(loginData.correo, loginData.password);

      // Notificar al padre (App.jsx)
      onLoginSuccess(response.user);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error al iniciar sesión');
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (registerData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: registerData.correo,
        email: registerData.correo,
        password: registerData.password,
        rol: registerData.tipoUsuario,
        nombre: registerData.nombre,
        cargo: registerData.cargo
      };

      const response = await register(payload);

      // Usuario puede iniciar sesión inmediatamente
      alert(response.mensaje || 'Cuenta creada exitosamente. Ya puedes iniciar sesión.');
      setIsLogin(true); // Cambiar a pestaña de login

    } catch (error) {
      console.error(error);
      alert(error.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo-ichilo.png?v=2" alt="Facultad Integral de Ichilo" />
        </div>

        {/* Título */}
        <h1 className="auth-title">Sistema de Documentos</h1>
        <p className="auth-subtitle">
          {isLogin
            ? 'Ingresa tus credenciales para continuar'
            : 'Crea tu cuenta para comenzar'}
        </p>

        {/* Pestañas */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </button>
        </div>

        {/* Contenido según pestaña */}
        {isLogin ? (
          // Formulario de LOGIN
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="auth-label">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              placeholder="tu@email.com"
              value={loginData.correo}
              onChange={handleLoginChange}
              className="auth-input"
              required
            />

            <label className="auth-label">Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={handleLoginChange}
              className="auth-input"
              required
            />

            <button type="submit" className="auth-button">
              Iniciar Sesión
            </button>

            <p className="auth-footer">
              ¿No tienes cuenta?{' '}
              <span
                className="auth-link"
                onClick={() => setIsLogin(false)}
              >
                Regístrate aquí
              </span>
            </p>
          </form>
        ) : (
          // Formulario de REGISTRO
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label className="auth-label">Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              placeholder="Juan Pérez"
              value={registerData.nombre}
              onChange={handleRegisterChange}
              className="auth-input"
              required
            />

            <label className="auth-label">Tipo de Usuario</label>
            <div className="tipo-usuario-container">
              <button
                type="button"
                className={`tipo-usuario-btn ${registerData.tipoUsuario === 'interno' ? 'active' : ''}`}
                onClick={() => handleTipoUsuario('interno')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Interno
              </button>
              <button
                type="button"
                className={`tipo-usuario-btn ${registerData.tipoUsuario === 'externo' ? 'active' : ''}`}
                onClick={() => handleTipoUsuario('externo')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Externo
              </button>
            </div>

            <label className="auth-label">Cargo</label>
            <input
              type="text"
              name="cargo"
              placeholder="Ej: Secretari@, Docente, Estudiante..."
              value={registerData.cargo}
              onChange={handleRegisterChange}
              className="auth-input"
              required
            />

            <label className="auth-label">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              placeholder="tu@email.com"
              value={registerData.correo}
              onChange={handleRegisterChange}
              className="auth-input"
              required
            />

            <label className="auth-label">Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={handleRegisterChange}
              className="auth-input"
              minLength="6"
              required
            />
            <p className="password-hint">Mínimo 6 caracteres</p>

            <label className="auth-label">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              className="auth-input"
              required
            />

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Crear Cuenta'}
            </button>

            <p className="auth-footer">
              ¿Ya tienes cuenta?{' '}
              <span
                className="auth-link"
                onClick={() => setIsLogin(true)}
              >
                Inicia sesión aquí
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;