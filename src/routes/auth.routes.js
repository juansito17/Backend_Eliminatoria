const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para el login
router.post('/login', authController.login);

// Ruta para el registro
router.post('/register', authController.register);

module.exports = router;
