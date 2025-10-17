const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_usuario, id_rol, nombre_usuario, email, activo, fecha_creacion, ultimo_acceso FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT id_usuario, id_rol, nombre_usuario, email, activo, fecha_creacion, ultimo_acceso FROM usuarios WHERE id_usuario = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    const { id_rol, nombre_usuario, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO usuarios (id_rol, nombre_usuario, email, password_hash) VALUES (?, ?, ?, ?)',
            [id_rol, nombre_usuario, email, password_hash]
        );
        res.status(201).json({ message: 'Usuario creado exitosamente', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }
        res.status(500).json({ message: 'Error al crear usuario', error: error.message });
    }
};

// Actualizar un usuario existente
exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { id_rol, nombre_usuario, email, password, activo } = req.body;
    let password_hash = null;

    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password, salt);
        }

        const [result] = await pool.query(
            `UPDATE usuarios SET
                id_rol = COALESCE(?, id_rol),
                nombre_usuario = COALESCE(?, nombre_usuario),
                email = COALESCE(?, email),
                password_hash = COALESCE(?, password_hash),
                activo = COALESCE(?, activo)
            WHERE id_usuario = ?`,
            [id_rol, nombre_usuario, email, password_hash, activo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }
        res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
    }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
};
