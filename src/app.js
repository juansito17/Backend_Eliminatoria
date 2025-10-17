const express = require('express');
const app = express();
const cors = require('cors'); // Importar el paquete cors
const usuariosRoutes = require('./routes/usuarios.routes');
const rolesRoutes = require('./routes/roles.routes');
const cultivosRoutes = require('./routes/cultivos.routes');
const trabajadoresRoutes = require('./routes/trabajadores.routes');
const laboresTiposRoutes = require('./routes/laboresTipos.routes');
const laboresAgricolasRoutes = require('./routes/laboresAgricolas.routes');
const alertasRoutes = require('./routes/alertas.routes');
const dashboardProduccionDiariaRoutes = require('./routes/dashboardProduccionDiaria.routes');
const reportesRoutes = require('./routes/reportes.routes'); // Importar las rutas de reportes
const authRoutes = require('./routes/auth.routes'); // Importar las rutas de autenticación

// Middlewares
app.use(express.json()); // Para parsear JSON en las peticiones
app.use(cors({ // Configurar CORS para permitir solicitudes desde el frontend
    origin: 'http://localhost:3000', // Reemplaza con el origen de tu frontend
    credentials: true
}));

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

// Rutas de Reportes
app.use('/api/reportes', reportesRoutes);

module.exports = app;
