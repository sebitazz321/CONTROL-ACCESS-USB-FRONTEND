import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Login */}
        <Route path="/" element={<Login />} />
        
        {/* Ruta para Administradores */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Ruta para Usuarios Regulares */}
        <Route path="/user" element={<UserDashboard />} />
        
        {/* Redirección por si escriben cualquier otra cosa */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;