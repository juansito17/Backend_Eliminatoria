const pool = require('../config/database');

// Obtener todos los tipos de labores
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT id_labor_tipo, nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso, fecha_creacion FROM labores_tipos');
    return rows;
};

// Obtener un tipo de labor por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT id_labor_tipo, nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso, fecha_creacion FROM labores_tipos WHERE id_labor_tipo = ?', [id]);
    return rows[0];
};

// Crear un nuevo tipo de labor
exports.create = async (nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso) => {
    const [result] = await pool.query(
        'INSERT INTO labores_tipos (nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso) VALUES (?, ?, ?, ?)',
        [nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso]
    );
    return result.insertId;
};

// Actualizar un tipo de labor existente
exports.update = async (id, nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso) => {
    const [result] = await pool.query(
        `UPDATE labores_tipos SET
            nombre_labor = COALESCE(?, nombre_labor),
            descripcion_labor = COALESCE(?, descripcion_labor),
            requiere_cantidad = COALESCE(?, requiere_cantidad),
            requiere_peso = COALESCE(?, requiere_peso)
        WHERE id_labor_tipo = ?`,
        [nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso, id]
    );
    return result.affectedRows;
};

// Eliminar un tipo de labor
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM labores_tipos WHERE id_labor_tipo = ?', [id]);
    return result.affectedRows;
};
