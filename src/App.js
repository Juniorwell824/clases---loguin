// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Inicialización del sistema
import { initializeSystemConfig } from './initializeConfig';

// Componentes de autenticación
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Componentes dashboard
import AdminDashboard from './components/dashboard/AdminDashboard';
import SocioDashboard from './components/dashboard/SocioDashboard';
import Dashboard from './components/dashboard/Dashboard';

// Rutas protegidas
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import SocioRoute from './components/auth/SocioRoute';
import PermissionRoute from './components/auth/PermissionRoute';

function App() {
  useEffect(() => {
    initializeSystemConfig();
  }, []);

  return (
    <Router>
      <Routes>
        {/* ====================== */}
        {/* RUTAS PÚBLICAS (Autenticación) */}
        {/* ====================== */}
        
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* ====================== */}
        {/* RUTAS PROTEGIDAS (Dashboards) */}
        {/* ====================== */}
        
        {/* Dashboard principal - con redirección automática según rol */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Dashboard para socios */}
        <Route path="/socio/dashboard" element={
          <PrivateRoute>
            <SocioRoute>
              <SocioDashboard />
            </SocioRoute>
          </PrivateRoute>
        } />
        
        {/* Dashboard para administradores */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </PrivateRoute>
        } />
        
        {/* ====================== */}
        {/* RUTAS ESPECÍFICAS CON PERMISOS */}
        {/* ====================== */}
        
        {/* Gestión de usuarios */}
        <Route path="/admin/usuarios" element={
          <PrivateRoute>
            <AdminRoute>
              <PermissionRoute requiredPermissions={['gestionar_usuarios']}>
                <AdminDashboard section="usuarios" />
              </PermissionRoute>
            </AdminRoute>
          </PrivateRoute>
        } />
        
        {/* ====================== */}
        {/* REDIRECCIONES */}
        {/* ====================== */}
        
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/socio" element={<Navigate to="/socio/dashboard" />} />
        
        {/* ====================== */}
        {/* RUTAS DE ERROR */}
        {/* ====================== */}
        
        <Route path="/404" element={
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
            <h2>Página no encontrada</h2>
            <p style={{ marginTop: '20px' }}>
              La página que buscas no existe o ha sido movida.
            </p>
            <a 
              href="/login" 
              style={{
                marginTop: '30px',
                padding: '10px 30px',
                background: '#2196f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
            >
              Ir al inicio de sesión
            </a>
          </div>
        } />
        
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </Router>
  );
}

export default App;
