const LaborAgricola = require('../models/laborAgricola.model');
const { getIo } = require('../socket'); // Importar la instancia de Socket.io

// Obtener todas las labores agrícolas
exports.getLaboresAgricolas = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', cultivoId = null, tipoLaborId = null } = req.query;
        let userId = null;

        // Si el usuario es un Operario (rol 3), solo puede ver sus propias labores
        if (req.user.rol === 3) {
            userId = req.user.id;
        }

        const { labores, totalPages, currentPage } = await LaborAgricola.findAll(
            search,
            cultivoId || null,
            tipoLaborId || null,
            userId,
            parseInt(page),
            parseInt(limit)
        );

        // Mapear los campos para que coincidan con lo que espera el frontend
        const laboresFormateadas = labores.map(labor => ({
            id: labor.id_labor,
            fecha: labor.fecha_labor,
            cultivo: labor.nombre_cultivo || 'Sin cultivo', // Usar nombre si está disponible
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
    const { id_lote, id_cultivo, id_trabajador, id_labor_tipo, /* id_usuario_registro, */ fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones } = req.body;
    try {
        // Forzar el usuario que registra a partir del token (evitar suplantación)
        const idUsuarioRegistro = req.user && req.user.id ? req.user.id : null;

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
            ubicacion_gps_punto,
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
    const { id_lote, id_cultivo, id_trabajador, id_labor_tipo, /* id_usuario_registro, */ fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones } = req.body;

    try {
        // Forzar que el usuario de registro sea el usuario autenticado (evitar suplantación).
        // Si el sistema permite que un administrador cambie el usuario registro, puede ajustarse aquí.
        const idUsuarioRegistro = req.user && req.user.id ? req.user.id : null;

        const affectedRows = await LaborAgricola.update(
            id,
            id_lote,
            id_cultivo,
            id_trabajador,
            id_labor_tipo,
            idUsuarioRegistro,
            fecha_labor,
            cantidad_recolectada,
            peso_kg,
            costo_aproximado,
            ubicacion_gps_punto,
            observaciones
        );
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Labor agrícola no encontrada para actualizar' });
        }
        const io = getIo();
        io.emit('actualizacion-labor-agricola', { id, id_lote, id_cultivo, id_trabajador, fecha_labor, cantidad_recolectada, peso_kg }); // Emitir evento WebSocket
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
