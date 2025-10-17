const express = require('express');
const router = express.Router();
const laboresAgricolasController = require('../controllers/laboresAgricolas.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación
const checkRole = require('../middleware/checkRole'); // Importar el middleware de autorización por roles

// Rutas para el CRUD de labores agrícolas
router.get('/', auth, laboresAgricolasController.getLaboresAgricolas);
router.get('/:id', auth, laboresAgricolasController.getLaborAgricolaById);
router.post('/', auth, checkRole([1, 2, 3]), laboresAgricolasController.createLaborAgricola); // Admin, Supervisor, Operario pueden crear
router.put('/:id', auth, checkRole([1, 2, 3]), laboresAgricolasController.updateLaborAgricola); // Admin, Supervisor, Operario pueden actualizar
router.delete('/:id', auth, checkRole([1]), laboresAgricolasController.deleteLaborAgricola); // Solo Admin puede eliminar


module.exports = router;
