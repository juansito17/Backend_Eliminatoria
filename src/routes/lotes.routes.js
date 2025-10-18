const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotes.controller');
const auth = require('../middleware/auth.middleware');
const checkRole = require('../middleware/checkRole');

// Rutas CRUD para lotes
router.get('/', auth, lotesController.getLotes); // cualquier usuario autenticado puede ver
router.get('/:id', auth, lotesController.getLoteById);
router.post('/', auth, checkRole([1,2]), lotesController.createLote); // solo Admin y Supervisor
router.put('/:id', auth, checkRole([1,2]), lotesController.updateLote);
router.delete('/:id', auth, checkRole([1]), lotesController.deleteLote); // solo Admin

// Asignar supervisor a un lote (Admin o Supervisor)
router.put('/:id/supervisor', auth, checkRole([1,2]), lotesController.assignSupervisor);

module.exports = router;
