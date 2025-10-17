const pool = require('../config/database');

// Obtener todas las alertas
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT * FROM alertas');
    return rows;
};

// Obtener una alerta por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM alertas WHERE id_alerta = ?', [id]);
    return rows[0];
};

// Crear una nueva alerta
exports.create = async (id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta) => {
    const [result] = await pool.query(
        'INSERT INTO alertas (id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta) VALUES (?, ?, ?, ?, ?, ?)',
        [id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta]
    );
    return result.insertId;
};

// Actualizar una alerta existente
exports.update = async (id, id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta) => {
    const [result] = await pool.query(
        `UPDATE alertas SET
            id_labor = COALESCE(?, id_labor),
            id_lote = COALESCE(?, id_lote),
            tipo_alerta = COALESCE(?, tipo_alerta),
            descripcion = COALESCE(?, descripcion),
            nivel_severidad = COALESCE(?, nivel_severidad),
            resuelta = COALESCE(?, resuelta)
        WHERE id_alerta = ?`,
        [id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta, id]
    );
    return result.affectedRows;
};

// Eliminar una alerta
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM alertas WHERE id_alerta = ?', [id]);
    return result.affectedRows;
};
