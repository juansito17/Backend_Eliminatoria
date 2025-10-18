const pool = require('../config/database');

// Helper: construir WKT POINT correcto (lon lat) a partir de distintos formatos de entrada
const buildPointWKT = (ubic) => {
    if (!ubic) return null;
    let lat, lon;

    // Aceptar string "lat,lon"
    if (typeof ubic === 'string') {
        const parts = ubic.split(',').map(p => p.trim());
        lat = parseFloat(parts[0]);
        lon = parseFloat(parts[1]);
    } else if (typeof ubic === 'object') {
        // Aceptar { latitude, longitude } o { lat, lon }
        lat = parseFloat(ubic.latitude ?? ubic.lat);
        lon = parseFloat(ubic.longitude ?? ubic.lon);
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    // WKT POINT requiere "POINT(lon lat)"
    return `POINT(${lon} ${lat})`;
};

// Obtener todas las labores agrícolas con filtros y paginación
exports.findAll = async (search = '', cultivoId = null, tipoLaborId = null, userId = null, page = 1, limit = 10) => {
    let query = `
        SELECT
            la.*,
            c.nombre_cultivo,
            t.nombre_completo,
            lt.nombre_labor,
            l.nombre_lote
        FROM labores_agricolas la
        LEFT JOIN cultivos c ON la.id_cultivo = c.id_cultivo
        LEFT JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
        LEFT JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
        LEFT JOIN lotes l ON la.id_lote = l.id_lote
    `;

    let countQuery = `
        SELECT COUNT(la.id_labor) as count
        FROM labores_agricolas la
        LEFT JOIN cultivos c ON la.id_cultivo = c.id_cultivo
        LEFT JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
        LEFT JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
        LEFT JOIN lotes l ON la.id_lote = l.id_lote
    `;

    const params = [];
    const countParams = [];
    const whereClauses = [];

    if (search) {
        whereClauses.push('(t.nombre_completo LIKE ? OR c.nombre_cultivo LIKE ? OR l.nombre_lote LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (cultivoId) {
        whereClauses.push('la.id_cultivo = ?');
        params.push(cultivoId);
        countParams.push(cultivoId);
    }
    if (tipoLaborId) {
        whereClauses.push('la.id_labor_tipo = ?');
        params.push(tipoLaborId);
        countParams.push(tipoLaborId);
    }
    if (userId) { // Para el rol 3 (Operario)
        whereClauses.push('la.id_usuario_registro = ?');
        params.push(userId);
        countParams.push(userId);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
        countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` ORDER BY la.fecha_labor DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);
    const totalItems = countRows[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    return { labores: rows, totalPages, currentPage: page };
};

// Obtener una labor agrícola por ID
exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM labores_agricolas WHERE id_labor = ?', [id]);
    return rows[0];
};

 // Crear una nueva labor agrícola
exports.create = async (id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones) => {
    // Construir WKT de forma segura
    const pointWkt = buildPointWKT(ubicacion_gps_punto);

    // Construir consulta y parámetros condicionalmente para evitar ST_GeomFromText(NULL)
    const query = `
        INSERT INTO labores_agricolas
            (id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${pointWkt ? 'ST_GeomFromText(?)' : 'NULL'}, ?)
    `;

    const params = [
        id_lote,
        id_cultivo,
        id_trabajador,
        id_labor_tipo,
        id_usuario_registro,
        fecha_labor,
        cantidad_recolectada,
        peso_kg,
        costo_aproximado
    ];

    if (pointWkt) params.push(pointWkt);
    params.push(observaciones);

    const [result] = await pool.query(query, params);
    return result.insertId;
};

 // Actualizar una labor agrícola existente
exports.update = async (id, id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones) => {
    // Construir WKT para posible actualización de ubicación
    const pointWkt = buildPointWKT(ubicacion_gps_punto);

    // Construir dinámicamente las cláusulas SET y parámetros para evitar ST_GeomFromText(NULL)
    const setClauses = [
        'id_lote = COALESCE(?, id_lote)',
        'id_cultivo = COALESCE(?, id_cultivo)',
        'id_trabajador = COALESCE(?, id_trabajador)',
        'id_labor_tipo = COALESCE(?, id_labor_tipo)',
        'id_usuario_registro = COALESCE(?, id_usuario_registro)',
        'fecha_labor = COALESCE(?, fecha_labor)',
        'cantidad_recolectada = COALESCE(?, cantidad_recolectada)',
        'peso_kg = COALESCE(?, peso_kg)',
        'costo_aproximado = COALESCE(?, costo_aproximado)'
    ];

    const params = [
        id_lote,
        id_cultivo,
        id_trabajador,
        id_labor_tipo,
        id_usuario_registro,
        fecha_labor,
        cantidad_recolectada,
        peso_kg,
        costo_aproximado
    ];

    if (pointWkt) {
        setClauses.push('ubicacion_gps_punto = ST_GeomFromText(?)');
        params.push(pointWkt);
    }

    setClauses.push('observaciones = COALESCE(?, observaciones)');
    params.push(observaciones);

    const query = `UPDATE labores_agricolas SET ${setClauses.join(', ')} WHERE id_labor = ?`;
    params.push(id);

    const [result] = await pool.query(query, params);
    return result.affectedRows;
};

// Eliminar una labor agrícola
exports.delete = async (id) => {
    const [result] = await pool.query('DELETE FROM labores_agricolas WHERE id_labor = ?', [id]);
    return result.affectedRows;
};
