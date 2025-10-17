const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');

// Rutas para el CRUD de roles
router.get('/', rolesController.getRoles);
router.get('/:id', rolesController.getRoleById);
router.post('/', rolesController.createRole);
router.put('/:id', rolesController.updateRole);
router.delete('/:id', rolesController.deleteRole);

module.exports = router;
