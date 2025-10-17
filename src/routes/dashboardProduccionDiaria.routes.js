const express = require('express');
const router = express.Router();
const dashboardProduccionDiariaController = require('../controllers/dashboardProduccionDiaria.controller');

// Rutas para el CRUD de registros de producción diaria
router.get('/', dashboardProduccionDiariaController.getDashboardProduccionDiaria);
router.get('/:id', dashboardProduccionDiariaController.getDashboardProduccionDiariaById);
router.post('/', dashboardProduccionDiariaController.createDashboardProduccionDiaria);
router.put('/:id', dashboardProduccionDiariaController.updateDashboardProduccionDiaria);
router.delete('/:id', dashboardProduccionDiariaController.deleteDashboardProduccionDiaria);

module.exports = router;
