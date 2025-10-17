const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de trabajadores
router.get('/', auth, trabajadoresController.getTrabajadores);
router.get('/:id', auth, trabajadoresController.getTrabajadorById);
router.post('/', auth, trabajadoresController.createTrabajador);
router.put('/:id', auth, trabajadoresController.updateTrabajador);
router.delete('/:id', auth, trabajadoresController.deleteTrabajador);

module.exports = router;
