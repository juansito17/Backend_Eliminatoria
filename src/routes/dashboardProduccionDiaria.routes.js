const express = require('express');
const router = express.Router();
const dashboardProduccionDiariaController = require('../controllers/dashboardProduccionDiaria.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Ruta para obtener los datos agregados del dashboard
router.get('/', auth, dashboardProduccionDiariaController.getDashboardProduccionDiaria);

module.exports = router;
