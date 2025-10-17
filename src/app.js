const express = require('express');
const app = express();
const usuariosRoutes = require('./routes/usuarios.routes');
const rolesRoutes = require('./routes/roles.routes');
const cultivosRoutes = require('./routes/cultivos.routes');
const trabajadoresRoutes = require('./routes/trabajadores.routes');
const laboresTiposRoutes = require('./routes/laboresTipos.routes');
const laboresAgricolasRoutes = require('./routes/laboresAgricolas.routes');
const alertasRoutes = require('./routes/alertas.routes');
const dashboardProduccionDiariaRoutes = require('./routes/dashboardProduccionDiaria.routes');
const authRoutes = require('./routes/auth.routes'); // Importar las rutas de autenticación

// Middlewares
app.use(express.json()); // Para parsear JSON en las peticiones

// Rutas
app.get('/', (req, res) => {
    res.send('API de Agricultura de Precisión');
});

// Rutas de Autenticación
app.use('/api/auth', authRoutes);

// Rutas de Usuarios
app.use('/api/usuarios', usuariosRoutes);

// Rutas de Roles
app.use('/api/roles', rolesRoutes);

// Rutas de Cultivos
app.use('/api/cultivos', cultivosRoutes);

// Rutas de Trabajadores
app.use('/api/trabajadores', trabajadoresRoutes);

// Rutas de Tipos de Labores
app.use('/api/labores-tipos', laboresTiposRoutes);

// Rutas de Labores Agrícolas
app.use('/api/labores-agricolas', laboresAgricolasRoutes);

// Rutas de Alertas
app.use('/api/alertas', alertasRoutes);

// Rutas de Dashboard Producción Diaria
app.use('/api/dashboard-produccion-diaria', dashboardProduccionDiariaRoutes);

module.exports = app;
