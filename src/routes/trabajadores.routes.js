const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores.controller');

// Rutas para el CRUD de trabajadores
router.get('/', trabajadoresController.getTrabajadores);
router.get('/:id', trabajadoresController.getTrabajadorById);
router.post('/', trabajadoresController.createTrabajador);
router.put('/:id', trabajadoresController.updateTrabajador);
router.delete('/:id', trabajadoresController.deleteTrabajador);

module.exports = router;
