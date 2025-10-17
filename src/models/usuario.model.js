const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT id_usuario, id_rol, nombre_usuario, email, activo, fecha_creacion, ultimo_acceso FROM usuarios');
    return rows;
};

// Obtener un usuario por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT id_usuario, id_rol, nombre_usuario, email, activo, fecha_creacion, ultimo_acceso FROM usuarios WHERE id_usuario = ?', [id]);
    return rows[0];
};

// Crear un nuevo usuario
exports.create = async (id_rol, nombre_usuario, email, password) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
        'INSERT INTO usuarios (id_rol, nombre_usuario, email, password_hash) VALUES (?, ?, ?, ?)',
        [id_rol, nombre_usuario, email, password_hash]
    );
    return result.insertId;
};

// Actualizar un usuario existente
exports.update = async (id, id_rol, nombre_usuario, email, password, activo) => {
    let password_hash = null;
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
    return result.affectedRows;
};

// Eliminar un usuario
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
    return result.affectedRows;
};
