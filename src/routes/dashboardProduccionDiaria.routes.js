const express = require('express');
const router = express.Router();
const dashboardProduccionDiariaController = require('../controllers/dashboardProduccionDiaria.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de registros de producción diaria
router.get('/', auth, dashboardProduccionDiariaController.getDashboardProduccionDiaria);
router.get('/:id', auth, dashboardProduccionDiariaController.getDashboardProduccionDiariaById);
router.post('/', auth, dashboardProduccionDiariaController.createDashboardProduccionDiaria);
router.put('/:id', auth, dashboardProduccionDiariaController.updateDashboardProduccionDiaria);
router.delete('/:id', auth, dashboardProduccionDiariaController.deleteDashboardProduccionDiaria);

module.exports = router;
