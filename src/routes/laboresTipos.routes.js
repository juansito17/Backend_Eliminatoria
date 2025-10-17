const express = require('express');
const router = express.Router();
const laboresTiposController = require('../controllers/laboresTipos.controller');

// Rutas para el CRUD de tipos de labores
router.get('/', laboresTiposController.getLaboresTipos);
router.get('/:id', laboresTiposController.getLaborTipoById);
router.post('/', laboresTiposController.createLaborTipo);
router.put('/:id', laboresTiposController.updateLaborTipo);
router.delete('/:id', laboresTiposController.deleteLaborTipo);

module.exports = router;
