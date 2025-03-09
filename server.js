// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
    secret: 'secret-key-12345',
    resave: false,
    saveUninitialized: false,
}));

// Usuario de ejemplo: 
// Usuario y contraseña: "reservaSanLuis"
// La contraseña se ha hasheado con bcrypt (salt rounds = 10)
const users = [
    {
        id: 1,
        email: "reservaSanLuis@xx.com",
        password: "$2b$10$8Rfq8H30gk0dAZP7joJDY.GiWxoQQs7vLHXkRcDev6awKrNTVTcKS"
    }
];

// Ruta POST para login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Almacenar el id del usuario en la sesión
    req.session.userId = user.id;
    return res.json({ message: 'Login exitoso', userId: user.id });
});

// Ruta para obtener datos del dashboard (usuario autenticado)
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
