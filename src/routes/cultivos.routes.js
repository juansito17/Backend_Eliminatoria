const express = require('express');
const router = express.Router();
const cultivosController = require('../controllers/cultivos.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de cultivos
router.get('/', auth, cultivosController.getCultivos);
router.get('/:id', auth, cultivosController.getCultivoById);
router.post('/', auth, cultivosController.createCultivo);
router.put('/:id', auth, cultivosController.updateCultivo);
router.delete('/:id', auth, cultivosController.deleteCultivo);

module.exports = router;
