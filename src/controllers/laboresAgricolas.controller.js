const LaborAgricola = require('../models/laborAgricola.model');
const { getIo } = require('../socket'); // Importar la instancia de Socket.io

// Obtener todas las labores agrícolas
exports.getLaboresAgricolas = async (req, res) => {
    try {
        const laboresAgricolas = await LaborAgricola.findAll();
        res.json(laboresAgricolas);
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
        res.json(laborAgricola);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener labor agrícola', error: error.message });
    }
};

// Crear una nueva labor agrícola
exports.createLaborAgricola = async (req, res) => {
    const { id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones } = req.body;
    try {
        const id = await LaborAgricola.create(id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones);
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
    const { id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones } = req.body;

    try {
        const affectedRows = await LaborAgricola.update(id, id_lote, id_cultivo, id_trabajador, id_labor_tipo, id_usuario_registro, fecha_labor, cantidad_recolectada, peso_kg, costo_aproximado, ubicacion_gps_punto, observaciones);
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
