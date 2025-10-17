const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const auth = require('../middleware/auth.middleware');

// Ruta para generar reporte de labores agrícolas en PDF
router.get('/labores/pdf', auth, reportesController.generateLaboresPdf);

// Ruta para generar reporte de labores agrícolas en Excel
router.get('/labores/excel', auth, reportesController.generateLaboresExcel);

module.exports = router;
