const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const auth = require('../middleware/auth.middleware');

// Rutas para generar reportes en archivos
router.get('/labores/pdf', auth, reportesController.generateLaboresPdf);
router.get('/labores/excel', auth, reportesController.generateLaboresExcel);

// Nuevas rutas para estadísticas y datos agregados
router.get('/produccion-diaria', auth, reportesController.getProduccionDiaria);
router.get('/rendimiento-lote', auth, reportesController.getRendimientoLote);
router.get('/eficiencia-trabajador', auth, reportesController.getEficienciaTrabajador);
router.get('/historico-labores', auth, reportesController.getHistoricoLabores);
router.get('/labores-detallado', auth, reportesController.getLaboresDetallado);

module.exports = router;
