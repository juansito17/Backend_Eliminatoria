const express = require('express');
const router = express.Router();
const laboresAgricolasController = require('../controllers/laboresAgricolas.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación
const checkPermission = require('../middleware/checkPermission'); // Importar el middleware de autorización por permisos (acciones)
const { body } = require('express-validator'); // Validaciones

 // Rutas para el CRUD de labores agrícolas
router.get('/', auth, laboresAgricolasController.getLaboresAgricolas);
router.get('/:id', auth, checkPermission('getLabor'), laboresAgricolasController.getLaborAgricolaById);
router.post(
    '/',
    auth,
    checkPermission('createLabor'),
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
); // Creación validada por permisos (Operario = solo para sí; Supervisor = para su equipo; Admin = todo)
router.put(
    '/:id',
    auth,
    checkPermission('updateLabor'),
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
); // Actualización validada por permisos (Operario = ventana limitada; Supervisor = corrección de su equipo; Admin = todo)
router.delete('/:id', auth, checkPermission('deleteLabor'), laboresAgricolasController.deleteLaborAgricola); // Solo Admin puede eliminar (checkPermission deniega a no-admin)


module.exports = router;
