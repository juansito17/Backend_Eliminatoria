const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para el login
router.post('/login', authController.login);

// Ruta para el registro
router.post('/register', authController.register);
router.get('/verify-token', authController.verifyToken); // Nueva ruta para verificar el token

module.exports = router;
