const Alerta = require('../models/alerta.model');
const { getIo } = require('../socket'); // Importar la instancia de Socket.io

// Obtener todas las alertas
exports.getAlertas = async (req, res) => {
    try {
        const alertas = await Alerta.findAll();
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
    }
};

// Función para verificar y generar alertas automáticamente
exports.checkAndGenerateAlerts = async () => {
    try {
        // Ejemplo: Verificar baja en rendimiento (si el peso_kg promedio del día es menor a un umbral)
        const [promedioPesoResult] = await pool.query(`
            SELECT AVG(peso_kg) AS promedio_peso
            FROM labores_agricolas
            WHERE DATE(fecha_labor) = CURDATE();
        `);
        const promedio_peso_hoy = promedioPesoResult[0].promedio_peso || 0;

        const umbral_bajo_rendimiento = 50; // Ejemplo: umbral en kg

        if (promedio_peso_hoy > 0 && promedio_peso_hoy < umbral_bajo_rendimiento) {
            const tipo_alerta = 'BAJO_RENDIMIENTO';
            const descripcion = `El rendimiento promedio de hoy (${promedio_peso_hoy.toFixed(2)} kg) está por debajo del umbral (${umbral_bajo_rendimiento} kg).`;
            const nivel_severidad = 'Medio';

            // Verificar si ya existe una alerta similar para hoy
            const [existingAlert] = await pool.query(`
                SELECT * FROM alertas
                WHERE tipo_alerta = ? AND DATE(fecha_creacion) = CURDATE() AND resuelta = FALSE;
            `, [tipo_alerta]);

            if (existingAlert.length === 0) {
                const id = await Alerta.create(null, null, tipo_alerta, descripcion, nivel_severidad, false);
                const io = getIo();
                io.emit('nueva-alerta', { id, tipo_alerta, descripcion, nivel_severidad });
                console.log('Alerta de bajo rendimiento generada:', descripcion);
            } else {
                console.log('Ya existe una alerta de bajo rendimiento activa para hoy.');
            }
        }
        // Se pueden añadir más lógicas para otros tipos de alertas (fallos de pesaje, retrasos, etc.)

    } catch (error) {
        console.error('Error al verificar y generar alertas:', error);
    }
};

// Obtener una alerta por ID
exports.getAlertaById = async (req, res) => {
    const { id } = req.params;
    try {
        const alerta = await Alerta.findById(id);
        if (!alerta) {
            return res.status(404).json({ message: 'Alerta no encontrada' });
        }
        res.json(alerta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alerta', error: error.message });
    }
};

// Crear una nueva alerta
exports.createAlerta = async (req, res) => {
    const { id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta } = req.body;
    try {
        const id = await Alerta.create(id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta);
        const io = getIo();
        io.emit('nueva-alerta', { id, id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta }); // Emitir evento WebSocket
        res.status(201).json({ message: 'Alerta creada exitosamente', id });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear alerta', error: error.message });
    }
};

// Actualizar una alerta existente
exports.updateAlerta = async (req, res) => {
    const { id } = req.params;
    const { id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta } = req.body;

    try {
        const affectedRows = await Alerta.update(id, id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Alerta no encontrada para actualizar' });
        }
        const io = getIo();
        io.emit('actualizacion-alerta', { id, id_labor, id_lote, tipo_alerta, descripcion, nivel_severidad, resuelta }); // Emitir evento WebSocket
        res.json({ message: 'Alerta actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar alerta', error: error.message });
    }
};

// Eliminar una alerta
exports.deleteAlerta = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await Alerta.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Alerta no encontrada para eliminar' });
        }
        const io = getIo();
        io.emit('eliminacion-alerta', { id }); // Emitir evento WebSocket
        res.json({ message: 'Alerta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar alerta', error: error.message });
    }
};
