const pool = require('../config/database');

// Obtener todos los cultivos
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT id_cultivo, nombre_cultivo, descripcion_cultivo, fecha_creacion FROM cultivos');
    return rows;
};

// Obtener un cultivo por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT id_cultivo, nombre_cultivo, descripcion_cultivo, fecha_creacion FROM cultivos WHERE id_cultivo = ?', [id]);
    return rows[0];
};

// Crear un nuevo cultivo
exports.create = async (nombre_cultivo, descripcion_cultivo) => {
    const [result] = await pool.query(
        'INSERT INTO cultivos (nombre_cultivo, descripcion_cultivo) VALUES (?, ?)',
        [nombre_cultivo, descripcion_cultivo]
    );
    return result.insertId;
};

// Actualizar un cultivo existente
exports.update = async (id, nombre_cultivo, descripcion_cultivo) => {
    const [result] = await pool.query(
        `UPDATE cultivos SET
            nombre_cultivo = COALESCE(?, nombre_cultivo),
            descripcion_cultivo = COALESCE(?, descripcion_cultivo)
        WHERE id_cultivo = ?`,
        [nombre_cultivo, descripcion_cultivo, id]
    );
    return result.affectedRows;
};

// Eliminar un cultivo
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM cultivos WHERE id_cultivo = ?', [id]);
    return result.affectedRows;
};
