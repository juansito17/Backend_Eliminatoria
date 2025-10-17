const express = require('express');
const app = express();
const usuariosRoutes = require('./routes/usuarios.routes');
const rolesRoutes = require('./routes/roles.routes');
const cultivosRoutes = require('./routes/cultivos.routes');
const trabajadoresRoutes = require('./routes/trabajadores.routes');

// Middlewares
app.use(express.json()); // Para parsear JSON en las peticiones

// Rutas
app.get('/', (req, res) => {
    res.send('API de Agricultura de Precisión');
});

// Rutas de Usuarios
app.use('/api/usuarios', usuariosRoutes);

// Rutas de Roles
app.use('/api/roles', rolesRoutes);

// Rutas de Cultivos
app.use('/api/cultivos', cultivosRoutes);

// Rutas de Trabajadores
app.use('/api/trabajadores', trabajadoresRoutes);

module.exports = app;
