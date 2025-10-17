const express = require('express');
const app = express();
const usuariosRoutes = require('./routes/usuarios.routes');

// Middlewares
app.use(express.json()); // Para parsear JSON en las peticiones

// Rutas
app.get('/', (req, res) => {
    res.send('API de Agricultura de Precisión');
});

// Rutas de Usuarios
app.use('/api/usuarios', usuariosRoutes);

module.exports = app;
