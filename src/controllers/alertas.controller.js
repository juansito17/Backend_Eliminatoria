const Alerta = require('../models/alerta.model');

// Obtener todas las alertas
exports.getAlertas = async (req, res) => {
    try {
        const alertas = await Alerta.findAll();
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
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
        res.json({ message: 'Alerta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar alerta', error: error.message });
    }
};
