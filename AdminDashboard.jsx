import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function AdminDashboard() {
    const [usuarios, setUsuarios] = useState([]);
    const [reportes, setReportes] = useState([]); 
    const [view, setView] = useState('dashboard');
    const [showModal, setShowModal] = useState(false);
    
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', correo: '', contrasena: '', rol_id: '2' });

    const navigate = useNavigate();
    const nombreAdmin = localStorage.getItem('nombre') || 'Sebastian Grande';

    const cerrarSesion = () => {
        localStorage.clear();
        navigate('/');
    };

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [resU, resR] = await Promise.all([
                api.get('/admin/usuarios', config),
                api.get('/admin/reportes', config)
            ]);
            setUsuarios(resU.data);
            setReportes(resR.data);
        } catch (err) {
            console.error("Error al cargar datos");
        }
    };

    // >>> NUEVA FUNCIÓN AÑADIDA: ELIMINAR <<<
    const eliminarUsuario = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await api.delete(`/admin/usuarios/${id}`, config);
                alert("Usuario eliminado");
                cargarDatos(); // Recarga la lista
            } catch (err) {
                alert("Error al eliminar");
            }
        }
    };

    const handleCrearUsuario = async (e) => {
        e.preventDefault();
        try {
            await api.post('/registrar', nuevoUsuario);
            alert("Usuario creado con éxito");
            setShowModal(false);
            setNuevoUsuario({ nombre: '', correo: '', contrasena: '', rol_id: '2' });
            cargarDatos();
        } catch (err) {
            alert("Error al crear usuario");
        }
    };

    const descargarPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Actividad - USB ADMIN", 20, 10);
        const tableColumn = ["Usuario", "Evento", "Fecha", "Hora"];
        const tableRows = reportes.map(log => [log.nombre, log.evento, log.fecha, log.hora]);
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`Reporte_USB_${new Date().toLocaleDateString()}.pdf`);
    };

    useEffect(() => { cargarDatos(); }, []);

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2 style={{color: 'var(--usb-orange)', fontWeight: '800'}}>USB ADMIN</h2>
                <nav>
                    <div className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>📊 Dashboard</div>
                    <div className={`nav-link ${view === 'usuarios' ? 'active' : ''}`} onClick={() => setView('usuarios')}>👥 Gestión de Usuarios</div>
                    <div className={`nav-link ${view === 'reportes' ? 'active' : ''}`} onClick={() => setView('reportes')}>📑 Reportes</div>
                    <button onClick={cerrarSesion} className="btn-modern" style={{marginTop: 'auto', background: '#334155'}}>Cerrar Sesión</button>
                </nav>
            </aside>

            <main className="main-content">
                <header style={{marginBottom: '2rem'}}>
                    <h1 style={{color: 'var(--usb-blue)'}}>Panel de Control - {nombreAdmin}</h1>
                </header>

                {view === 'dashboard' && (
                    <>
                        <div className="metrics-grid">
                            <div className="metric-card"><h4>TOTAL USUARIOS</h4><p>{usuarios.length}</p></div>
                            <div className="metric-card"><h4>ACTIVOS</h4><p style={{color: '#166534'}}>{usuarios.filter(u => u.estado === 1).length}</p></div>
                            <div className="metric-card"><h4>INACTIVOS</h4><p style={{color: '#991b1b'}}>{usuarios.filter(u => u.estado !== 1).length}</p></div>
                            <div className="metric-card"><h4>ROLES</h4><p style={{color: 'var(--usb-orange)'}}>2</p></div>
                        </div>

                        <div className="table-container" style={{marginTop: '2rem', padding: '2rem'}}>
                            <h3>Acciones rápidas</h3>
                            <div style={quickActionsGrid}>
                                <div style={actionBox} onClick={() => { setView('usuarios'); setShowModal(true); }}>
                                    <span style={{fontSize: '2rem'}}>👤+</span>
                                    <p style={{fontWeight: '600', marginTop: '10px'}}>Crear nuevo usuario</p>
                                </div>
                                <div style={actionBox} onClick={() => setView('reportes')}>
                                    <span style={{fontSize: '2rem'}}>📊</span>
                                    <p style={{fontWeight: '600', marginTop: '10px'}}>Ver reportes</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {view === 'usuarios' && (
                    <div className="table-container">
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                            <h3>Usuarios Registrados</h3>
                            <button className="btn-modern" style={{width: 'auto'}} onClick={() => setShowModal(true)}>+ Crear cuenta</button>
                        </div>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>NOMBRE</th>
                                    <th>CORREO</th>
                                    <th>ROL</th>
                                    <th>ESTADO</th>
                                    <th>ACCIONES</th> {/* COLUMNA AÑADIDA */}
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.nombre}</td>
                                        <td>{u.correo}</td>
                                        <td>{u.nombre_rol}</td>
                                        <td><span className={`status-pill ${u.estado === 1 ? 'status-active' : 'status-inactive'}`}>{u.estado === 1 ? 'Activo' : 'Inactivo'}</span></td>
                                        <td>
                                            {/* BOTÓN ELIMINAR AÑADIDO */}
                                            <button 
                                                onClick={() => eliminarUsuario(u.id)}
                                                style={{background: '#991b1b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {view === 'reportes' && (
                    <div className="table-container">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                            <h3>Historial de Actividad</h3>
                            <button onClick={descargarPDF} className="btn-modern" style={{width: 'auto', background: '#166534'}}>📥 Descargar PDF</button>
                        </div>
                        <table className="modern-table">
                            <thead><tr><th>USUARIO</th><th>EVENTO</th><th>FECHA</th><th>HORA</th></tr></thead>
                            <tbody>
                                {reportes.map(log => (
                                    <tr key={log.id}><td>{log.nombre}</td><td>{log.evento}</td><td>{log.fecha}</td><td>{log.hora}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showModal && (
                <div style={modalOverlayStyle}>
                    <div className="login-card" style={{width: '400px', background: 'white', padding: '2rem', position: 'relative'}}>
                        <button onClick={() => setShowModal(false)} style={closeBtnStyle}>✕</button>
                        <h2 style={{marginBottom: '1rem'}}>Nueva Cuenta</h2>
                        <form onSubmit={handleCrearUsuario}>
                            <input className="modern-input" type="text" placeholder="Nombre completo" value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} required />
                            <input className="modern-input" type="email" placeholder="Correo" style={{marginTop: '10px'}} value={nuevoUsuario.correo} onChange={(e) => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})} required />
                            <input className="modern-input" type="password" placeholder="Contraseña" style={{marginTop: '10px'}} value={nuevoUsuario.contrasena} onChange={(e) => setNuevoUsuario({...nuevoUsuario, contrasena: e.target.value})} required />
                            <select className="modern-input" style={{marginTop: '10px'}} value={nuevoUsuario.rol_id} onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol_id: e.target.value})}>
                                <option value="1">Administrador</option>
                                <option value="2">Usuario regular</option>
                            </select>
                            <button type="submit" className="btn-modern" style={{marginTop: '20px'}}>REGISTRAR USUARIO</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const quickActionsGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' };
const actionBox = { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', textAlign: 'center', cursor: 'pointer', background: 'white' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const closeBtnStyle = { position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' };

export default AdminDashboard;