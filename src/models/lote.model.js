const pool = require('../config/database');

// Obtener todos los lotes (opcional: incluir nombre de cultivo si existe)
exports.findAll = async () => {
  const [rows] = await pool.query(
    `SELECT 
      l.id_lote,
      l.nombre_lote,
      l.area_hectareas,
      l.ubicacion_gps_poligono,
      l.id_cultivo,
      c.nombre_cultivo AS cultivo_nombre,
      l.id_supervisor,
      u.nombre_usuario AS supervisor_nombre,
      l.fecha_creacion
    FROM lotes l
    LEFT JOIN cultivos c ON l.id_cultivo = c.id_cultivo
    LEFT JOIN usuarios u ON l.id_supervisor = u.id_usuario
    ORDER BY l.id_lote DESC`
  );
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      l.id_lote,
      l.nombre_lote,
      l.area_hectareas,
      l.ubicacion_gps_poligono,
      l.id_cultivo,
      c.nombre_cultivo AS cultivo_nombre,
      l.id_supervisor,
      u.nombre_usuario AS supervisor_nombre,
      l.fecha_creacion
    FROM lotes l
    LEFT JOIN cultivos c ON l.id_cultivo = c.id_cultivo
    LEFT JOIN usuarios u ON l.id_supervisor = u.id_usuario
    WHERE l.id_lote = ?`,
    [id]
  );
  return rows[0];
};

exports.create = async (nombre_lote, area_hectareas = null, id_cultivo = null, ubicacion_gps_poligono = null, id_supervisor = null) => {
  const [result] = await pool.query(
    'INSERT INTO lotes (nombre_lote, area_hectareas, id_cultivo, ubicacion_gps_poligono, id_supervisor) VALUES (?, ?, ?, ?, ?)',
    [nombre_lote, area_hectareas, id_cultivo, ubicacion_gps_poligono, id_supervisor]
  );
  return result.insertId;
};

exports.update = async (id, nombre_lote, area_hectareas, id_cultivo, ubicacion_gps_poligono, id_supervisor) => {
  const [result] = await pool.query(
    `UPDATE lotes SET
      nombre_lote = COALESCE(?, nombre_lote),
      area_hectareas = COALESCE(?, area_hectareas),
      id_cultivo = COALESCE(?, id_cultivo),
      ubicacion_gps_poligono = COALESCE(?, ubicacion_gps_poligono),
      id_supervisor = COALESCE(?, id_supervisor)
    WHERE id_lote = ?`,
    [nombre_lote, area_hectareas, id_cultivo, ubicacion_gps_poligono, id_supervisor, id]
  );
  return result.affectedRows;
};

exports.delete = async (id) => {
  const [result] = await pool.query('DELETE FROM lotes WHERE id_lote = ?', [id]);
  return result.affectedRows;
};
