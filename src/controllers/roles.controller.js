const Role = require('../models/role.model');

// Obtener todos los roles
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        // Mapear los campos para que coincidan con lo que espera el frontend
        const rolesFormateados = roles.map(role => ({
            id: role.id_rol,
            nombre: role.nombre_rol,
            descripcion: role.descripcion_rol,
            fecha_creacion: role.fecha_creacion
        }));
        res.json({ roles: rolesFormateados });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener roles', error: error.message });
    }
};

// Obtener un rol por ID
exports.getRoleById = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Mapear los campos para que coincidan con lo que espera el frontend
        const roleFormateado = {
            id: role.id_rol,
            nombre: role.nombre_rol,
            descripcion: role.descripcion_rol,
            fecha_creacion: role.fecha_creacion
        };

        res.json(roleFormateado);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener rol', error: error.message });
    }
};

// Crear un nuevo rol
exports.createRole = async (req, res) => {
    const { nombre_rol, descripcion_rol } = req.body;
    try {
        const id = await Role.create(nombre_rol, descripcion_rol);
        res.status(201).json({ message: 'Rol creado exitosamente', id });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El nombre de rol ya existe' });
        }
        res.status(500).json({ message: 'Error al crear rol', error: error.message });
    }
};

// Actualizar un rol existente
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { nombre_rol, descripcion_rol } = req.body;

    try {
        const affectedRows = await Role.update(id, nombre_rol, descripcion_rol);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Rol no encontrado para actualizar' });
        }
        res.json({ message: 'Rol actualizado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El nombre de rol ya existe' });
        }
        res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
    }
};

// Eliminar un rol
exports.deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await Role.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Rol no encontrado para eliminar' });
        }
        res.json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_ROW_IS_REFERENCED_2')) {
            return res.status(409).json({ message: 'No se puede eliminar el rol porque tiene usuarios asociados.' });
        }
        res.status(500).json({ message: 'Error al eliminar rol', error: error.message });
    }
};
