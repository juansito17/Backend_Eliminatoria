const express = require('express');
const router = express.Router();
const laboresTiposController = require('../controllers/laboresTipos.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de tipos de labores
router.get('/', auth, laboresTiposController.getLaboresTipos);
router.get('/:id', auth, laboresTiposController.getLaborTipoById);
router.post('/', auth, laboresTiposController.createLaborTipo);
router.put('/:id', auth, laboresTiposController.updateLaborTipo);
router.delete('/:id', auth, laboresTiposController.deleteLaborTipo);

module.exports = router;
