const Alerta = require('../models/alerta.model');
const pool = require('../config/database'); // Importar la conexión a la base de datos
const { getIo } = require('../socket'); // Importar la instancia de Socket.io

// Obtener todas las alertas
exports.getAlertas = async (req, res) => {
    try {
        const alertas = await Alerta.findAll();
        // Mapear los campos para que coincidan con lo que espera el frontend
        const alertasFormateadas = alertas.map(alerta => ({
            id: alerta.id_alerta,
            id_labor: alerta.id_labor,
            id_lote: alerta.id_lote,
            tipo_alerta: alerta.tipo_alerta,
            descripcion: alerta.descripcion,
            nivel_severidad: alerta.nivel_severidad,
            resuelta: alerta.resuelta,
            fecha_creacion: alerta.fecha_creacion
        }));
        res.json({ alertas: alertasFormateadas });
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
                io.emit('nueva-alerta', {
                    id,
                    id_labor: null,
                    id_lote: null,
                    tipo_alerta,
                    descripcion,
                    nivel_severidad,
                    resuelta: false,
                    fecha_creacion: new Date().toISOString()
                });
                console.log('Alerta de bajo rendimiento generada:', descripcion);
            } else {
                console.log('Ya existe una alerta de bajo rendimiento activa para hoy.');
            }
        }

        // Nueva lógica: Verificar fallos de pesaje (si hay registros con peso_kg = 0 o NULL)
        const [fallosPesajeResult] = await pool.query(`
            SELECT COUNT(*) AS count_fallos
            FROM labores_agricolas
            WHERE DATE(fecha_labor) = CURDATE()
            AND (peso_kg = 0 OR peso_kg IS NULL);
        `);
        const fallos_pesaje_hoy = fallosPesajeResult[0].count_fallos || 0;

        if (fallos_pesaje_hoy > 0) {
            const tipo_alerta = 'FALLO_PESAJE';
            const descripcion = `Se detectaron ${fallos_pesaje_hoy} registro(s) con fallos de pesaje hoy.`;
            const nivel_severidad = 'Alto';

            // Verificar si ya existe una alerta similar para hoy
            const [existingAlert] = await pool.query(`
                SELECT * FROM alertas
                WHERE tipo_alerta = ? AND DATE(fecha_creacion) = CURDATE() AND resuelta = FALSE;
            `, [tipo_alerta]);

            if (existingAlert.length === 0) {
                const id = await Alerta.create(null, null, tipo_alerta, descripcion, nivel_severidad, false);
                const io = getIo();
                io.emit('nueva-alerta', {
                    id,
                    id_labor: null,
                    id_lote: null,
                    tipo_alerta,
                    descripcion,
                    nivel_severidad,
                    resuelta: false,
                    fecha_creacion: new Date().toISOString()
                });
                console.log('Alerta de fallo de pesaje generada:', descripcion);
            }
        }

        // Nueva lógica: Verificar retrasos en cosecha (si hay tareas programadas pero no completadas)
        const [retrasosResult] = await pool.query(`
            SELECT COUNT(*) AS count_retrasos
            FROM labores_agricolas
            WHERE DATE(fecha_labor) < CURDATE()
            AND fecha_labor IS NOT NULL;
        `);
        const retrasos_hoy = retrasosResult[0].count_retrasos || 0;

        if (retrasos_hoy > 0) {
            const tipo_alerta = 'RETRASO_COSECHA';
            const descripcion = `Se detectaron ${retrasos_hoy} labor(es) con retraso en la fecha programada.`;
            const nivel_severidad = 'Medio';

            // Verificar si ya existe una alerta similar para hoy
            const [existingAlert] = await pool.query(`
                SELECT * FROM alertas
                WHERE tipo_alerta = ? AND DATE(fecha_creacion) = CURDATE() AND resuelta = FALSE;
            `, [tipo_alerta]);

            if (existingAlert.length === 0) {
                const id = await Alerta.create(null, null, tipo_alerta, descripcion, nivel_severidad, false);
                const io = getIo();
                io.emit('nueva-alerta', {
                    id,
                    id_labor: null,
                    id_lote: null,
                    tipo_alerta,
                    descripcion,
                    nivel_severidad,
                    resuelta: false,
                    fecha_creacion: new Date().toISOString()
                });
                console.log('Alerta de retraso en cosecha generada:', descripcion);
            }
        }

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

        // Mapear los campos para que coincidan con lo que espera el frontend
        const alertaFormateada = {
            id: alerta.id_alerta,
            id_labor: alerta.id_labor,
            id_lote: alerta.id_lote,
            tipo_alerta: alerta.tipo_alerta,
            descripcion: alerta.descripcion,
            nivel_severidad: alerta.nivel_severidad,
            resuelta: alerta.resuelta,
            fecha_creacion: alerta.fecha_creacion
        };

        res.json(alertaFormateada);
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
