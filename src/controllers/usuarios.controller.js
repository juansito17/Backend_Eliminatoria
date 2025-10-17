const Usuario = require('../models/usuario.model');

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        // Mapear los campos para que coincidan con lo que espera el frontend
        const usuariosFormateados = usuarios.map(usuario => ({
            id: usuario.id_usuario,
            rol: usuario.id_rol,
            username: usuario.nombre_usuario,
            email: usuario.email,
            activo: usuario.activo,
            fecha_creacion: usuario.fecha_creacion,
            ultimo_acceso: usuario.ultimo_acceso
        }));
        res.json({ usuarios: usuariosFormateados });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Mapear los campos para que coincidan con lo que espera el frontend
        const usuarioFormateado = {
            id: usuario.id_usuario,
            rol: usuario.id_rol,
            username: usuario.nombre_usuario,
            email: usuario.email,
            activo: usuario.activo,
            fecha_creacion: usuario.fecha_creacion,
            ultimo_acceso: usuario.ultimo_acceso
        };

        res.json(usuarioFormateado);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    const { id_rol, nombre_usuario, email, password } = req.body;
    try {
        const id = await Usuario.create(id_rol, nombre_usuario, email, password);
        res.status(201).json({ message: 'Usuario creado exitosamente', id });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) { // Manejo de error de duplicado de email
            return res.status(409).json({ message: 'El email ya está registrado' });
        }
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

// Actualizar un usuario existente
exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { id_rol, nombre_usuario, email, password, activo } = req.body;

    try {
        const affectedRows = await Usuario.update(id, id_rol, nombre_usuario, email, password, activo);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) { // Manejo de error de duplicado de email
            return res.status(409).json({ message: 'El email ya está registrado' });
        }
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await Usuario.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};
