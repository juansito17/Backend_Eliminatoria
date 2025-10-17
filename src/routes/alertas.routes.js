const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertas.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de alertas
router.get('/', auth, alertasController.getAlertas);
router.get('/:id', auth, alertasController.getAlertaById);
router.post('/', auth, alertasController.createAlerta);
router.put('/:id', auth, alertasController.updateAlerta);
router.delete('/:id', auth, alertasController.deleteAlerta);

module.exports = router;
