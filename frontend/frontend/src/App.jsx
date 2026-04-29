import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VerifyEmail from './components/VerifyEmail';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Documentos from './components/Documentos';
import Usuarios from './components/Usuarios';
import Calendario from './components/Calendario';
import { getUser, logout } from './services/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // { username, rol }
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [navParams, setNavParams] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('dashboard');
    setNavParams(null);
  };

  // Verificar sesión al inicio
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }

    // Escuchar evento de sesión expirada
    const handleUnauthorized = () => {
      handleLogout();
      // Opcional: Mostrar mensaje de 'Sesión expirada'
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Función para manejar el login exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  // Función para navegar con parámetros
  const handleNavigate = (page, params = null) => {
    setCurrentPage(page);
    setNavParams(params);
  };



  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Componente principal de la aplicación (Auth o Dashboard)
  const MainContent = () => {
    // Si no está autenticado, mostrar página de login
    if (!isAuthenticated) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} />;
    }

    // Si está autenticado, mostrar el dashboard con sidebar
    return (
      <div className="app-container">
        <Sidebar
          currentPage={currentPage}
          onPageChange={(page) => handleNavigate(page)}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          user={user}
        />
        <div className={`app-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {currentPage === 'dashboard' && <Dashboard user={user} onNavigate={handleNavigate} />}
          {currentPage === 'documentos' && <Documentos user={user} initialFilters={navParams} />}
          {currentPage === 'calendario' && <Calendario user={user} onNavigate={handleNavigate} />}
          {currentPage === 'usuarios' && <Usuarios />}
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={<MainContent />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;