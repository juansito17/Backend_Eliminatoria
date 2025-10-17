const LaborTipo = require('../models/laborTipo.model');

// Obtener todos los tipos de labores
exports.getLaboresTipos = async (req, res) => {
    try {
        const laboresTipos = await LaborTipo.findAll();
        res.json(laboresTipos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tipos de labores', error: error.message });
    }
};

// Obtener un tipo de labor por ID
exports.getLaborTipoById = async (req, res) => {
    const { id } = req.params;
    try {
        const laborTipo = await LaborTipo.findById(id);
        if (!laborTipo) {
            return res.status(404).json({ message: 'Tipo de labor no encontrado' });
        }
        res.json(laborTipo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tipo de labor', error: error.message });
    }
};

// Crear un nuevo tipo de labor
exports.createLaborTipo = async (req, res) => {
    const { nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso } = req.body;
    try {
        const id = await LaborTipo.create(nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso);
        res.status(201).json({ message: 'Tipo de labor creado exitosamente', id });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El nombre del tipo de labor ya existe' });
        }
        res.status(500).json({ message: 'Error al crear tipo de labor', error: error.message });
    }
};

// Actualizar un tipo de labor existente
exports.updateLaborTipo = async (req, res) => {
    const { id } = req.params;
    const { nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso } = req.body;

    try {
        const affectedRows = await LaborTipo.update(id, nombre_labor, descripcion_labor, requiere_cantidad, requiere_peso);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tipo de labor no encontrado para actualizar' });
        }
        res.json({ message: 'Tipo de labor actualizado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El nombre del tipo de labor ya existe' });
        }
        res.status(500).json({ message: 'Error al actualizar tipo de labor', error: error.message });
    }
};

// Eliminar un tipo de labor
exports.deleteLaborTipo = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await LaborTipo.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Tipo de labor no encontrado para eliminar' });
        }
        res.json({ message: 'Tipo de labor eliminado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_ROW_IS_REFERENCED_2')) {
            return res.status(409).json({ message: 'No se puede eliminar el tipo de labor porque tiene labores agrícolas asociadas.' });
        }
        res.status(500).json({ message: 'Error al eliminar tipo de labor', error: error.message });
    }
};
