const pool = require('../config/database');
const LaborAgricola = require('../models/laborAgricola.model');
const { getIo } = require('../socket'); // Importar la instancia de Socket.io

/** Obtener todas las labores agrícolas con filtrado por rol:
 *  - Operario (rol 3): solo labores del trabajador vinculado al usuario
 *  - Supervisor (rol 2): labores de los trabajadores asignados al supervisor
 *  - Admin (rol 1): todas (sin filtros)
 */
exports.getLaboresAgricolas = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', cultivoId = null, tipoLaborId = null } = req.query;

        // Determinar filtros según rol
        const rol = Number(req.user.rol);
        const userId = req.user.id_usuario || req.user.id; // compatibilidad payload

        let trabajadorFilter = null; // puede ser null, número o array
        let usuarioRegistroId = null;

        if (rol === 3) { // Operario: obtener id_trabajador vinculado
            const [rows] = await pool.query('SELECT id_trabajador FROM trabajadores WHERE id_usuario = ? AND activo = 1 LIMIT 1', [userId]);
            if (rows.length === 0) {
                // No vinculado: devolver lista vacía para mayor seguridad
                return res.json({ labores: [], totalPages: 0, currentPage: Number(page) });
            }
            trabajadorFilter = rows[0].id_trabajador;
        } else if (rol === 2) { // Supervisor: obtener trabajadores a su cargo
            const [rows] = await pool.query('SELECT id_trabajador FROM supervisor_trabajador WHERE id_supervisor = ? AND activo = 1', [userId]);
            const trabajadoresIds = rows.map(r => r.id_trabajador);
            // Si no tiene trabajadores asignados, devolver vacío
            if (trabajadoresIds.length === 0) {
                return res.json({ labores: [], totalPages: 0, currentPage: Number(page) });
            }
            trabajadorFilter = trabajadoresIds;
        } else {
            // Admin: sin filtros
        }

        const { labores, totalPages, currentPage } = await LaborAgricola.findAll(
            search,
            cultivoId || null,
            tipoLaborId || null,
            null, // usuarioRegistroId (no usamos para estos filtros)
            trabajadorFilter,
            parseInt(page),
            parseInt(limit)
        );

        // Mapear los campos para que coincidan con lo que espera el frontend
        const laboresFormateadas = labores.map(labor => ({
            id: labor.id_labor,
            fecha: labor.fecha_labor,
            cultivo: labor.nombre_cultivo || 'Sin cultivo',
            lote: labor.nombre_lote || 'Sin lote',
            trabajador: labor.nombre_completo || 'Sin trabajador',
            tipoLabor: labor.nombre_labor || 'Sin tipo',
            cantidadRecolectada: labor.cantidad_recolectada,
            peso: labor.peso_kg,
            hora: labor.fecha_labor ? new Date(labor.fecha_labor).toTimeString().slice(0, 5) : '',
            ubicacionGPS: labor.ubicacion_gps_punto,
            id_usuario_registro: labor.id_usuario_registro
        }));

        res.json({ labores: laboresFormateadas, totalPages, currentPage });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener labores agrícolas', error: error.message });
    }
};

// Obtener una labor agrícola por ID
exports.getLaborAgricolaById = async (req, res) => {
    const { id } = req.params;
    try {
        const laborAgricola = await LaborAgricola.findById(id);
        if (!laborAgricola) {
            return res.status(404).json({ message: 'Labor agrícola no encontrada' });
        }

        // Si el usuario es un Operario (rol 3), solo puede ver sus propias labores
        if (req.user.rol === 3 && laborAgricola.id_usuario_registro !== req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para ver esta labor' });
        }

        res.json(laborAgricola);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener labor agrícola', error: error.message });
    }
};

 // Crear una nueva labor agrícola
exports.createLaborAgricola = async (req, res) => {
    const { id_lote, id_cultivo, id_trabajador: bodyIdTrabajador, id_labor_tipo, /* id_usuario_registro, */ fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones } = req.body;
    try {
        // Información usuario del token
        const userId = req.user && (req.user.id_usuario || req.user.id) ? (req.user.id_usuario || req.user.id) : null;
        const userRol = Number(req.user && req.user.rol);

        if (!userId || !userRol) {
            return res.status(401).json({ message: 'No autenticado o información de usuario incompleta' });
        }

        // Forzar el usuario que registra a partir del token (evitar suplantación)
        const idUsuarioRegistro = userId;

        // Definir ventana de edición para el operario (por ejemplo: 2 horas desde la creación)
        const horaLimiteEdicion = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

        // Validar y normalizar coordenadas GPS si vienen en el payload
        let normalizedUbic = null;
        if (ubicacion_gps_punto) {
          const parseCoord = (u) => {
            let lat, lon;
            if (typeof u === 'string') {
              const parts = u.split(',').map(p => p.trim());
              lat = parseFloat(parts[0]);
              lon = parseFloat(parts[1]);
            } else if (typeof u === 'object') {
              lat = parseFloat(u.latitude ?? u.lat);
              lon = parseFloat(u.longitude ?? u.lon);
            }
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
            if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
            // Normalizar a string "lat,lon" con 6 decimales
            return `${lat.toFixed(6)},${lon.toFixed(6)}`;
          };
          normalizedUbic = parseCoord(ubicacion_gps_punto);
          if (!normalizedUbic) {
            return res.status(400).json({ message: 'Ubicación GPS inválida. Formato esperado: "lat,lon" o {lat,lon} con coordenadas válidas.' });
          }
        }

        // Reglas adicionales por rol (defensa en profundidad)
        let id_trabajador = bodyIdTrabajador;
        if (userRol === 1) {
            // Admin: puede crear para cualquier trabajador (si proporciona)
        } else if (userRol === 3) {
            // Operario: solo puede crear para sí mismo -> obtener id_trabajador vinculado y forzar
            const [rows] = await pool.query('SELECT id_trabajador FROM trabajadores WHERE id_usuario = ? AND activo = 1 LIMIT 1', [userId]);
            if (!rows.length) {
                return res.status(403).json({ message: 'Operario no vinculado a trabajador. Contacte al administrador.' });
            }
            const myTrabajadorId = rows[0].id_trabajador;
            // Forzar que la labor sea para sí mismo
            id_trabajador = myTrabajadorId;
        } else if (userRol === 2) {
            // Supervisor: debe especificar id_trabajador y pertenecer a su equipo
            if (!bodyIdTrabajador) {
                return res.status(400).json({ message: 'id_trabajador es requerido para crear una labor.' });
            }
            const [rows] = await pool.query('SELECT 1 FROM supervisor_trabajador WHERE id_supervisor = ? AND id_trabajador = ? AND activo = 1 LIMIT 1', [userId, bodyIdTrabajador]);
            if (!rows.length) {
                return res.status(403).json({ message: 'Supervisor solo puede crear labores para trabajadores a su cargo.' });
            }
            id_trabajador = bodyIdTrabajador;
        } else {
            return res.status(403).json({ message: 'Rol no permitido para crear labores' });
        }

        const id = await LaborAgricola.create(
            id_lote,
            id_cultivo,
            id_trabajador,
            id_labor_tipo,
            idUsuarioRegistro,
            fecha_labor,
            cantidad_recolectada,
            peso_kg,
            costo_aproximado,
            normalizedUbic,
            observaciones
        );

        const io = getIo();
        io.emit('nueva-labor-agricola', { id, id_lote, id_cultivo, id_trabajador, fecha_labor, cantidad_recolectada, peso_kg }); // Emitir evento WebSocket
        res.status(201).json({ message: 'Labor agrícola creada exitosamente', id });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear labor agrícola', error: error.message });
    }
};

 // Actualizar una labor agrícola existente
exports.updateLaborAgricola = async (req, res) => {
    const { id } = req.params;
    const { id_lote, id_cultivo, id_trabajador: bodyIdTrabajador, id_labor_tipo, /* id_usuario_registro, */ fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones } = req.body;

    try {
        // Información usuario del token
        const userId = req.user && (req.user.id_usuario || req.user.id) ? (req.user.id_usuario || req.user.id) : null;
        const userRol = Number(req.user && req.user.rol);

        if (!userId || !userRol) {
            return res.status(401).json({ message: 'No autenticado o información de usuario incompleta' });
        }

        // Forzar que el usuario de registro sea el usuario autenticado (evitar suplantación).
        const idUsuarioRegistro = userId;

        // Validar y normalizar coordenadas GPS si vienen en el payload
        let normalizedUbic = null;
        if (ubicacion_gps_punto) {
          const parseCoord = (u) => {
            let lat, lon;
            if (typeof u === 'string') {
              const parts = u.split(',').map(p => p.trim());
              lat = parseFloat(parts[0]);
              lon = parseFloat(parts[1]);
            } else if (typeof u === 'object') {
              lat = parseFloat(u.latitude ?? u.lat);
              lon = parseFloat(u.longitude ?? u.lon);
            }
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
            if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
            return `${lat.toFixed(6)},${lon.toFixed(6)}`;
          };
          normalizedUbic = parseCoord(ubicacion_gps_punto);
          if (!normalizedUbic) {
            return res.status(400).json({ message: 'Ubicación GPS inválida. Formato esperado: "lat,lon" o {lat,lon} con coordenadas válidas.' });
          }
        }

        // Verificaciones de permiso adicionales (defensa en profundidad)
        // Obtener labor para comprobar propietario / trabajador
        const [laborRows] = await pool.query('SELECT id_labor, id_trabajador, id_usuario_registro, hora_limite_edicion FROM labores_agricolas WHERE id_labor = ? LIMIT 1', [id]);
        if (!laborRows.length) {
            return res.status(404).json({ message: 'Labor agrícola no encontrada' });
        }
        const labor = laborRows[0];

        if (userRol === 3) {
            // Operario: solo modificar sus propias labores y dentro de ventana
            const [myRows] = await pool.query('SELECT id_trabajador FROM trabajadores WHERE id_usuario = ? AND activo = 1 LIMIT 1', [userId]);
            if (!myRows.length) {
                return res.status(403).json({ message: 'Operario no vinculado a trabajador. Contacte al administrador.' });
            }
            const myTrabajadorId = myRows[0].id_trabajador;
            if (Number(labor.id_trabajador) !== Number(myTrabajadorId)) {
                return res.status(403).json({ message: 'Operario solo puede modificar sus propias labores.' });
            }
            // Ventana de edición
            if (labor.hora_limite_edicion) {
                const ahora = new Date();
                const limite = new Date(labor.hora_limite_edicion);
                if (ahora > limite) {
                    return res.status(403).json({ message: 'Periodo de edición expirado para esta labor.' });
                }
            } else {
                return res.status(403).json({ message: 'Edición por operario no permitida en esta labor (sin ventana definida).' });
            }
            // Evitar que el operario cambie el id_trabajador
            if (bodyIdTrabajador && Number(bodyIdTrabajador) !== Number(myTrabajadorId)) {
                return res.status(403).json({ message: 'Operario no puede reasignar la labor a otro trabajador.' });
            }
        }

        if (userRol === 2) {
            // Supervisor: solo si el trabajador pertenece a su equipo. Si está intentando reasignar, verificar destino
            const [asignRows] = await pool.query('SELECT 1 FROM supervisor_trabajador WHERE id_supervisor = ? AND id_trabajador = ? AND activo = 1 LIMIT 1', [userId, labor.id_trabajador]);
            if (!asignRows.length) {
                return res.status(403).json({ message: 'Supervisor no tiene permisos sobre la labor especificada.' });
            }
            if (bodyIdTrabajador && Number(bodyIdTrabajador) !== Number(labor.id_trabajador)) {
                // Verificar que el nuevo trabajador también pertenezca al supervisor
                const [destRows] = await pool.query('SELECT 1 FROM supervisor_trabajador WHERE id_supervisor = ? AND id_trabajador = ? AND activo = 1 LIMIT 1', [userId, bodyIdTrabajador]);
                if (!destRows.length) {
                    return res.status(403).json({ message: 'No puede reasignar la labor a un trabajador fuera de su equipo.' });
                }
            }
        }

        const affectedRows = await LaborAgricola.update(
            id,
            id_lote,
            id_cultivo,
            bodyIdTrabajador || labor.id_trabajador,
            id_labor_tipo,
            idUsuarioRegistro,
            fecha_labor,
            cantidad_recolectada,
            peso_kg,
            costo_aproximado,
            normalizedUbic,
            observaciones
        );
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Labor agrícola no encontrada para actualizar' });
        }
        const io = getIo();
        io.emit('actualizacion-labor-agricola', { id, id_lote, id_cultivo, id_trabajador: bodyIdTrabajador || labor.id_trabajador, fecha_labor, cantidad_recolectada, peso_kg }); // Emitir evento WebSocket
        res.json({ message: 'Labor agrícola actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar labor agrícola', error: error.message });
    }
};

// Eliminar una labor agrícola
exports.deleteLaborAgricola = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await LaborAgricola.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Labor agrícola no encontrada para eliminar' });
        }
        const io = getIo();
        io.emit('eliminacion-labor-agricola', { id }); // Emitir evento WebSocket
        res.json({ message: 'Labor agrícola eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar labor agrícola', error: error.message });
    }
};
