const express = require('express');
const router = express.Router();
const cultivosController = require('../controllers/cultivos.controller');

// Rutas para el CRUD de cultivos
router.get('/', cultivosController.getCultivos);
router.get('/:id', cultivosController.getCultivoById);
router.post('/', cultivosController.createCultivo);
router.put('/:id', cultivosController.updateCultivo);
router.delete('/:id', cultivosController.deleteCultivo);

module.exports = router;
