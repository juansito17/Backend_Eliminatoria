const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de usuarios
router.get('/', auth, usuariosController.getUsuarios);
router.get('/:id', auth, usuariosController.getUsuarioById);
router.post('/', auth, usuariosController.createUsuario);
router.put('/:id', auth, usuariosController.updateUsuario);
router.delete('/:id', auth, usuariosController.deleteUsuario);

module.exports = router;
