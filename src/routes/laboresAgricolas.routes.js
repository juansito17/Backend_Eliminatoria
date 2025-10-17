const express = require('express');
const router = express.Router();
const laboresAgricolasController = require('../controllers/laboresAgricolas.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de labores agrícolas
router.get('/', auth, laboresAgricolasController.getLaboresAgricolas);
router.get('/:id', auth, laboresAgricolasController.getLaborAgricolaById);
router.post('/', auth, laboresAgricolasController.createLaborAgricola);
router.put('/:id', auth, laboresAgricolasController.updateLaborAgricola);
router.delete('/:id', auth, laboresAgricolasController.deleteLaborAgricola);

module.exports = router;
