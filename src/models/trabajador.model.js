const pool = require('../config/database');

// Obtener todos los trabajadores
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT id_trabajador, nombre_completo, codigo_trabajador, activo, fecha_creacion FROM trabajadores');
    return rows;
};

// Obtener un trabajador por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT id_trabajador, nombre_completo, codigo_trabajador, activo, fecha_creacion FROM trabajadores WHERE id_trabajador = ?', [id]);
    return rows[0];
};

// Crear un nuevo trabajador
exports.create = async (nombre_completo, codigo_trabajador) => {
    const [result] = await pool.query(
        'INSERT INTO trabajadores (nombre_completo, codigo_trabajador) VALUES (?, ?)',
        [nombre_completo, codigo_trabajador]
    );
    return result.insertId;
};

// Actualizar un trabajador existente
exports.update = async (id, nombre_completo, codigo_trabajador, activo) => {
    const [result] = await pool.query(
        `UPDATE trabajadores SET
            nombre_completo = COALESCE(?, nombre_completo),
            codigo_trabajador = COALESCE(?, codigo_trabajador),
            activo = COALESCE(?, activo)
        WHERE id_trabajador = ?`,
        [nombre_completo, codigo_trabajador, activo, id]
    );
    return result.affectedRows;
};

// Eliminar un trabajador
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM trabajadores WHERE id_trabajador = ?', [id]);
    return result.affectedRows;
};
