const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const auth = require('../middleware/auth.middleware'); // Importar el middleware de autenticación

// Rutas para el CRUD de roles
router.get('/', auth, rolesController.getRoles);
router.get('/:id', auth, rolesController.getRoleById);
router.post('/', auth, rolesController.createRole);
router.put('/:id', auth, rolesController.updateRole);
router.delete('/:id', auth, rolesController.deleteRole);

module.exports = router;
