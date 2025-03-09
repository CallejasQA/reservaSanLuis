// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise'); // Utilizamos la versión con promesas

const app = express();
const PORT = 3000;

// Middlewares para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
    secret: 'secret-key-12345',
    resave: false,
    saveUninitialized: false,
}));

// Crear un pool de conexiones a la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // Reemplaza con tu usuario de MySQL
  password: '', // Reemplaza con tu contraseña de MySQL
  database: 'reservaSanLuis'
});

// Endpoint de login utilizando la base de datos
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Consulta para obtener el usuario por email
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        // Guardamos el ID del usuario en la sesión
        req.session.userId = user.id;
        return res.json({ message: 'Login exitoso', userId: user.id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Endpoint para el dashboard (usuario autenticado)
app.get('/dashboard', (req, res) => {
    if (req.session.userId) {
        return res.json({ message: 'Bienvenido al dashboard', userId: req.session.userId });
    }
    return res.status(401).json({ message: 'No autenticado' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
