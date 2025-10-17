const express = require('express');
const router = express.Router();
const laboresAgricolasController = require('../controllers/laboresAgricolas.controller');

// Rutas para el CRUD de labores agrícolas
router.get('/', laboresAgricolasController.getLaboresAgricolas);
router.get('/:id', laboresAgricolasController.getLaborAgricolaById);
router.post('/', laboresAgricolasController.createLaborAgricola);
router.put('/:id', laboresAgricolasController.updateLaborAgricola);
router.delete('/:id', laboresAgricolasController.deleteLaborAgricola);

module.exports = router;
