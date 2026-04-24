const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// CONEXIÓN A DB
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

// MIDDLEWARE SEGURIDAD
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: "No hay token" });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido" });
        req.usuario = decoded;
        next();
    });
};

// --- RUTAS ---

// Registro (Usado por Postman o Admin)
app.post('/api/registrar', async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol_id } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(contrasena, salt);
        await db.query('INSERT INTO usuarios (nombre, correo, contrasena, rol_id) VALUES (?, ?, ?, ?)', [nombre, correo, hash, rol_id]);
        res.status(201).json({ mensaje: "Usuario creado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const [rows] = await db.query('SELECT u.*, r.nombre_rol FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.correo = ?', [correo]);
        if (rows.length === 0) return res.status(404).json({ error: "No existe" });
        const user = rows[0];
        const esValida = await bcrypt.compare(contrasena, user.contrasena);
        if (!esValida) return res.status(401).json({ error: "Clave mal" });

        await db.query('INSERT INTO logs_acceso (usuario_id, evento) VALUES (?, ?)', [user.id, 'Inicio de Sesión']);

        const token = jwt.sign({ id: user.id, nombre: user.nombre, rol: user.nombre_rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, nombre: user.nombre, correo: user.correo, rol_id: user.rol_id, nombre_rol: user.nombre_rol });
    } catch (e) { res.status(500).send(e); }
});

// Admin: Obtener Usuarios
app.get('/api/admin/usuarios', verificarToken, async (req, res) => {
    const [rows] = await db.query('SELECT u.id, u.nombre, u.correo, u.estado, r.nombre_rol FROM usuarios u JOIN roles r ON u.rol_id = r.id');
    res.json(rows);
});

// Admin: Obtener Reportes
app.get('/api/admin/reportes', verificarToken, async (req, res) => {
    const [rows] = await db.query("SELECT l.id, u.nombre, l.evento, DATE_FORMAT(l.fecha_hora, '%Y-%m-%d') as fecha, DATE_FORMAT(l.fecha_hora, '%h:%i %p') as hora FROM logs_acceso l JOIN usuarios u ON l.usuario_id = u.id ORDER BY l.fecha_hora DESC");
    res.json(rows);
});

// >>> AÑADIDO: Admin Eliminar Usuario <<<
app.delete('/api/admin/usuarios/:id', verificarToken, async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ mensaje: "Eliminado" });
    } catch (e) { res.status(500).json({ error: "Error al borrar" }); }
});

// >>> AÑADIDO: Usuario Actualizar Perfil <<<
app.put('/api/usuario/actualizar', verificarToken, async (req, res) => {
    try {
        const { nombre, correo } = req.body;
        await db.query('UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?', [nombre, correo, req.usuario.id]);
        res.json({ mensaje: "Actualizado" });
    } catch (e) { res.status(500).json({ error: "Error al actualizar" }); }
});

app.listen(3000, () => console.log("🚀 Server Ready"));