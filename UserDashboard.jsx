import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function UserDashboard() {
    const [view, setView] = useState('inicio');
    const [fechaActual, setFechaActual] = useState('');
    const [infoTecnica, setInfoTecnica] = useState({ dispositivo: '', navegador: '' });
    const navigate = useNavigate();
    
    // ESTADOS PARA EDITAR (AÑADIDOS)
    const [editNombre, setEditNombre] = useState(localStorage.getItem('nombre') || '');
    const [editCorreo, setEditCorreo] = useState(localStorage.getItem('correo') || '');

    const nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    const correoUsuario = localStorage.getItem('correo') || 'correo@usb.edu.co';

    useEffect(() => {
        const actualizarHora = () => {
            const ahora = new Date();
            const opciones = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            setFechaActual(ahora.toLocaleDateString('es-CO', opciones));
        };
        actualizarHora();
        const intervalo = setInterval(actualizarHora, 1000);

        const ua = navigator.userAgent;
        let dispositivo = "PC / Laptop";
        if (/Android|iPhone/i.test(ua)) dispositivo = "Dispositivo Móvil";
        
        let navegador = "Google Chrome";
        if (ua.includes("Firefox")) navegador = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) navegador = "Safari";

        setInfoTecnica({ dispositivo, navegador });
        return () => clearInterval(intervalo);
    }, []);

    // >>> FUNCIÓN AÑADIDA: ACTUALIZAR DATOS REALES <<<
    const handleActualizar = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put('/usuario/actualizar', { nombre: editNombre, correo: editCorreo }, config);
            
            localStorage.setItem('nombre', editNombre);
            localStorage.setItem('correo', editCorreo);
            alert("¡Perfil actualizado!");
            window.location.reload(); 
        } catch (err) {
            alert("Error al actualizar");
        }
    };

    const cerrarSesion = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2 style={{color: 'var(--usb-orange)', fontWeight: '800'}}>USB USER</h2>
                <nav>
                    <div className={`nav-link ${view === 'inicio' ? 'active' : ''}`} onClick={() => setView('inicio')}>🏠 Mi Inicio</div>
                    <div className={`nav-link ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>👤 Mi Perfil</div>
                    <div className={`nav-link ${view === 'seguridad' ? 'active' : ''}`} onClick={() => setView('seguridad')}>🛡️ Seguridad</div>
                </nav>
                <button onClick={cerrarSesion} className="btn-modern" style={{marginTop: 'auto', background: '#334155'}}>Salir</button>
            </aside>

            <main className="main-content">
                <header style={{marginBottom: '2rem'}}>
                    <h1 style={{color: 'var(--usb-blue)'}}>¡Hola, {nombreUsuario}! 👋</h1>
                    <p style={{color: '#64748b'}}>Bienvenido(a). Tu conexión es segura.</p>
                </header>

                {view === 'inicio' && (
                    <>
                        <div className="metrics-grid">
                            <div className="metric-card"><h4>ESTADO ACTUAL</h4><p style={{color: '#166534', fontSize: '1.5rem'}}>CONECTADO</p></div>
                            <div className="metric-card"><h4>HORA DEL SISTEMA</h4><p style={{fontSize: '0.9rem', fontWeight: 'bold'}}>{fechaActual}</p></div>
                            <div className="metric-card"><h4>TU IP ESTIMADA</h4><p style={{fontSize: '1rem'}}>190.156.XXX.XXX</p></div>
                        </div>
                        <div className="table-container">
                            <h3>Registro de sesión actual</h3>
                            <table className="modern-table">
                                <thead><tr><th>DISPOSITIVO</th><th>NAVEGADOR</th><th>UBICACIÓN</th><th>ESTADO</th></tr></thead>
                                <tbody>
                                    <tr><td>{infoTecnica.dispositivo}</td><td>{infoTecnica.navegador}</td><td>Cali, Colombia</td><td><span className="status-pill status-active">En línea</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {view === 'perfil' && (
                    <div className="table-container" style={{maxWidth: '700px'}}>
                        <h2 style={{marginBottom: '2rem'}}>Perfil de Usuario</h2>
                        <div className="input-group">
                            <label>NOMBRE COMPLETO</label>
                            <input className="modern-input" type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>CORREO REGISTRADO</label>
                            <input className="modern-input" type="email" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} />
                        </div>
                        {/* BOTÓN AHORA FUNCIONAL */}
                        <button className="btn-modern" style={{width: '200px', background: 'var(--usb-orange)'}} onClick={handleActualizar}>Actualizar Datos</button>
                    </div>
                )}

                {view === 'seguridad' && (
                    <div className="table-container" style={{maxWidth: '700px'}}>
                        <h2>Seguridad de la Cuenta</h2>
                        <p style={{marginBottom: '20px'}}>Cambia tu contraseña periódicamente.</p>
                        <div className="input-group">
                            <label>NUEVA CONTRASEÑA</label>
                            <input className="modern-input" type="password" placeholder="Mínimo 8 caracteres" />
                        </div>
                        <button className="btn-modern" style={{background: 'var(--usb-blue)'}}>Cambiar Contraseña</button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default UserDashboard;