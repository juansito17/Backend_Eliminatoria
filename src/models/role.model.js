const pool = require('../config/database');

// Obtener todos los roles
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT id_rol, nombre_rol, descripcion_rol, fecha_creacion FROM roles');
    return rows;
};

// Obtener un rol por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT id_rol, nombre_rol, descripcion_rol, fecha_creacion FROM roles WHERE id_rol = ?', [id]);
    return rows[0];
};

// Crear un nuevo rol
exports.create = async (nombre_rol, descripcion_rol) => {
    const [result] = await pool.query(
        'INSERT INTO roles (nombre_rol, descripcion_rol) VALUES (?, ?)',
        [nombre_rol, descripcion_rol]
    );
    return result.insertId;
};

// Actualizar un rol existente
exports.update = async (id, nombre_rol, descripcion_rol) => {
    const [result] = await pool.query(
        `UPDATE roles SET
            nombre_rol = COALESCE(?, nombre_rol),
            descripcion_rol = COALESCE(?, descripcion_rol)
        WHERE id_rol = ?`,
        [nombre_rol, descripcion_rol, id]
    );
    return result.affectedRows;
};

// Eliminar un rol
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM roles WHERE id_rol = ?', [id]);
    return result.affectedRows;
};
