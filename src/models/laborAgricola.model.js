const pool = require('../config/database');

// Obtener todas las labores agrícolas
exports.findAll = async () => {
    const [rows] = await pool.query('SELECT * FROM labores_agricolas');
    return rows;
};

// Obtener una labor agrícola por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM labores_agricolas WHERE id_labor = ?', [id]);
    return rows[0];
};

// Crear una nueva labor agrícola
exports.create = async (id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones) => {
    const [result] = await pool.query(
        `INSERT INTO labores_agricolas (id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?))`,
        [id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto ? `POINT(${ubicacion_gps_punto.latitude} ${ubicacion_gps_punto.longitude})` : null, observaciones]
    );
    return result.insertId;
};

// Actualizar una labor agrícola existente
exports.update = async (id, id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones) => {
    const [result] = await pool.query(
        `UPDATE labores_agricolas SET
            id_lote = COALESCE(?, id_lote),
            id_cultivo = COALESCE(?, id_cultivo),
            id_trabajador = COALESCE(?, id_trabajador),
            id_labor_tipo = COALESCE(?, id_labor_tipo),
            id_usuario_registro = COALESCE(?, id_usuario_registro),
            fecha_labor = COALESCE(?, fecha_labor),
            cantidad_recolectada = COALESCE(?, cantidad_recolectada),
            peso_kg = COALESCE(?, peso_kg),
            costo_aproximado = COALESCE(?, costo_aproximado),
            ubicacion_gps_punto = COALESCE(ST_GeomFromText(?), ubicacion_gps_punto),
            observaciones = COALESCE(?, observaciones)
        WHERE id_labor = ?`,
        [id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto ? `POINT(${ubicacion_gps_punto.latitude} ${ubicacion_gps_punto.longitude})` : null, observaciones, id]
    );
    return result.affectedRows;
};

// Eliminar una labor agrícola
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM labores_agricolas WHERE id_labor = ?', [id]);
    return result.affectedRows;
};
