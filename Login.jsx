import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Tu configuración de axios

function Login() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiamos errores previos

        try {
            // Enviamos los datos al endpoint de login
            const res = await api.post('/login', { correo, contrasena });

            if (res.data) {
                // --- AQUÍ ESTÁ LA MAGIA ---
                // Guardamos todo lo necesario para que el Dashboard sea dinámico
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('nombre', res.data.nombre); // Nombre real (Sebastian, Valentina, etc.)
                localStorage.setItem('correo', res.data.correo); // Correo del usuario
                localStorage.setItem('rol', res.data.rol_id);   // ID del rol (1: Admin, 2: User)

                // Redirección inteligente según el rol
                if (parseInt(res.data.rol_id) === 1) {
                    navigate('/admin'); // Si es admin
                } else {
                    navigate('/user');  // Si es usuario regular
                }
            }
        } catch (err) {
            // Si las credenciales fallan o el servidor no responde
            setError('Correo o contraseña incorrectos. Intenta de nuevo.');
            console.error("Error en el login:", err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2 style={{ color: 'var(--usb-blue)' }}>INICIAR SESIÓN</h2>
                    <p>Accede a la plataforma USB ADMIN</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>CORREO ELECTRÓNICO</label>
                        <input 
                            className="modern-input"
                            type="email" 
                            placeholder="usuario@usb.edu.co" 
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>CONTRASEÑA</label>
                        <input 
                            className="modern-input"
                            type="password" 
                            placeholder="••••••••" 
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required 
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#991b1b', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
                            ⚠️ {error}
                        </p>
                    )}

                    <button type="submit" className="btn-modern">
                        INGRESAR
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <a href="#" style={{ color: '#64748b', fontSize: '0.8rem' }}>¿Olvidaste tu contraseña?</a>
                </div>
            </div>
        </div>
    );
}

export default Login;