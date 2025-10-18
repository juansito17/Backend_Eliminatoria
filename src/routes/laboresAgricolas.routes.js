const express = require('express');
const router = express.Router();
const laboresAgricolasController = require('../controllers/laboresAgricolas.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación
const checkRole = require('../middleware/checkRole'); // Importar el middleware de autorización por roles
const { body } = require('express-validator'); // Validaciones

 // Rutas para el CRUD de labores agrícolas
router.get('/', auth, laboresAgricolasController.getLaboresAgricolas);
router.get('/:id', auth, laboresAgricolasController.getLaborAgricolaById);
router.post(
    '/',
    auth,
    checkRole([1, 2, 3]),
    [
        body('id_lote').isInt().withMessage('id_lote debe ser entero'),
        body('id_cultivo').isInt().withMessage('id_cultivo debe ser entero'),
        body('id_trabajador').isInt().withMessage('id_trabajador debe ser entero'),
        body('id_labor_tipo').isInt().withMessage('id_labor_tipo debe ser entero'),
        body('fecha_labor').notEmpty().withMessage('fecha_labor es requerido'),
        body('cantidad_recolectada').optional().isFloat({ min: 0 }).withMessage('cantidad_recolectada inválida'),
        body('peso_kg').optional().isFloat({ min: 0 }).withMessage('peso_kg inválido'),
        body('ubicacion_gps_punto').optional().matches(/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/).withMessage('ubicacion_gps_punto debe ser "lat,lon"')
    ],
    laboresAgricolasController.createLaborAgricola
); // Admin, Supervisor, Operario pueden crear
router.put(
    '/:id',
    auth,
    checkRole([1, 2, 3]),
    [
        body('id_lote').optional().isInt().withMessage('id_lote debe ser entero'),
        body('id_cultivo').optional().isInt().withMessage('id_cultivo debe ser entero'),
        body('id_trabajador').optional().isInt().withMessage('id_trabajador debe ser entero'),
        body('id_labor_tipo').optional().isInt().withMessage('id_labor_tipo debe ser entero'),
        body('fecha_labor').optional().notEmpty().withMessage('fecha_labor inválida'),
        body('cantidad_recolectada').optional().isFloat({ min: 0 }).withMessage('cantidad_recolectada inválida'),
        body('peso_kg').optional().isFloat({ min: 0 }).withMessage('peso_kg inválido'),
        body('ubicacion_gps_punto').optional().matches(/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/).withMessage('ubicacion_gps_punto debe ser "lat,lon"')
    ],
    laboresAgricolasController.updateLaborAgricola
); // Admin, Supervisor, Operario pueden actualizar
router.delete('/:id', auth, checkRole([1]), laboresAgricolasController.deleteLaborAgricola); // Solo Admin puede eliminar


module.exports = router;
