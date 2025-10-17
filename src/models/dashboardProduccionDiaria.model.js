const pool = require('../config/database');

// Obtener todos los registros de producción diaria
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT * FROM dashboard_produccion_diaria');
    return rows;
};

// Obtener un registro de producción diaria por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM dashboard_produccion_diaria WHERE id = ?', [id]);
    return rows[0];
};

// Crear un nuevo registro de producción diaria
exports.create = async (fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado) => {
    const [result] = await pool.query(
        'INSERT INTO dashboard_produccion_diaria (fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado) VALUES (?, ?, ?, ?, ?, ?)',
        [fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado]
    );
    return result.insertId;
};

// Actualizar un registro de producción diaria existente
exports.update = async (id, fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado) => {
    const [result] = await pool.query(
        `UPDATE dashboard_produccion_diaria SET
            fecha = COALESCE(?, fecha),
            id_lote = COALESCE(?, id_lote),
            id_cultivo = COALESCE(?, id_cultivo),
            total_peso_kg = COALESCE(?, total_peso_kg),
            productividad_promedio_trabajador = COALESCE(?, productividad_promedio_trabajador),
            costo_total_aproximado = COALESCE(?, costo_total_aproximado)
        WHERE id = ?`,
        [fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado, id]
    );
    return result.affectedRows;
};

// Eliminar un registro de producción diaria
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM dashboard_produccion_diaria WHERE id = ?', [id]);
    return result.affectedRows;
};
