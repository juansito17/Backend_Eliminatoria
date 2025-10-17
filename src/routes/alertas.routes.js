const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertas.controller');

// Rutas para el CRUD de alertas
router.get('/', alertasController.getAlertas);
router.get('/:id', alertasController.getAlertaById);
router.post('/', alertasController.createAlerta);
router.put('/:id', alertasController.updateAlerta);
router.delete('/:id', alertasController.deleteAlerta);

module.exports = router;
