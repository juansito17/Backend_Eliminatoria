const pool = require('../config/database');

// Helper para construir la consulta base
const getBaseQuery = () => `
    SELECT
        la.id_labor,
        la.fecha_labor,
        la.id_cultivo,
        c.nombre_cultivo,
        la.id_lote,
        l.nombre_lote,
        la.id_trabajador,
        t.nombre_completo AS nombre_trabajador,
        la.id_labor_tipo,
        lt.nombre_labor,
        la.cantidad_recolectada,
        la.peso_kg,
        la.ubicacion_gps_punto,
        la.id_usuario_registro
    FROM labores_agricolas la
    LEFT JOIN cultivos c ON la.id_cultivo = c.id_cultivo
    LEFT JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
    LEFT JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
    LEFT JOIN lotes l ON la.id_lote = l.id_lote
`;

// Obtener todas las labores agrícolas con filtros y paginación
exports.findAllWithFiltersAndPagination = async (userId, page, limit, search, cultivoId, tipoLaborId) => {
    let query = getBaseQuery();
    let countQuery = `SELECT COUNT(la.id_labor) AS total FROM labores_agricolas la LEFT JOIN cultivos c ON la.id_cultivo = c.id_cultivo LEFT JOIN lotes l ON la.id_lote = l.id_lote LEFT JOIN trabajadores t ON la.id_trabajador = t.id_trabajador LEFT JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo`;
    const params = [];
    const countParams = [];
    const conditions = [];

    if (userId) {
        conditions.push('la.id_usuario_registro = ?');
        params.push(userId);
        countParams.push(userId);
    }

    if (search) {
        const searchTerm = `%${search}%`;
        conditions.push('(c.nombre_cultivo LIKE ? OR l.nombre_lote LIKE ? OR t.nombre_completo LIKE ? OR lt.nombre_labor LIKE ?)');
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (cultivoId && cultivoId !== '') {
        const cultivoIdNum = parseInt(cultivoId);
        if (!isNaN(cultivoIdNum)) {
            conditions.push('la.id_cultivo = ?');
            params.push(cultivoIdNum);
            countParams.push(cultivoIdNum);
        }
    }

    if (tipoLaborId && tipoLaborId !== '') {
        const tipoLaborIdNum = parseInt(tipoLaborId);
        if (!isNaN(tipoLaborIdNum)) {
            conditions.push('la.id_labor_tipo = ?');
            params.push(tipoLaborIdNum);
            countParams.push(tipoLaborIdNum);
        }
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY la.fecha_labor DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const [laboresRows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);

    return {
        labores: laboresRows.map(labor => ({
            id_labor: labor.id_labor,
            fecha_labor: labor.fecha_labor,
            id_cultivo: labor.id_cultivo,
            nombre_cultivo: labor.nombre_cultivo,
            id_lote: labor.id_lote,
            nombre_lote: labor.nombre_lote,
            id_trabajador: labor.id_trabajador,
            nombre_completo: labor.nombre_trabajador,
            id_labor_tipo: labor.id_labor_tipo,
            nombre_labor: labor.nombre_labor,
            cantidad_recolectada: labor.cantidad_recolectada,
            peso_kg: labor.peso_kg,
            ubicacion_gps_punto: labor.ubicacion_gps_punto,
            id_usuario_registro: labor.id_usuario_registro,
        })),
        total: countRows[0].total,
    };
};

// Obtener una labor agrícola por ID
exports.findById = async (id) => {
    const [rows] = await pool.query(`${getBaseQuery()} WHERE la.id_labor = ?`, [id]);
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
