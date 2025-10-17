const Cultivo = require('../models/cultivo.model');

// Obtener todos los cultivos
exports.getCultivos = async (req, res) => {
    try {
        const cultivos = await Cultivo.findAll();
        // Mapear los campos de la base de datos a los nombres esperados por el frontend
        const cultivosFormateados = cultivos.map(cultivo => ({
            id: cultivo.id_cultivo,
            nombre: cultivo.nombre_cultivo
        }));
        res.json({ cultivos: cultivosFormateados });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cultivos', error: error.message });
    }
};

// Obtener un cultivo por ID
exports.getCultivoById = async (req, res) => {
    const { id } = req.params;
    try {
        const cultivo = await Cultivo.findById(id);
        if (!cultivo) {
            return res.status(404).json({ message: 'Cultivo no encontrado' });
        }
        res.json(cultivo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cultivo', error: error.message });
    }
};

// Crear un nuevo cultivo
exports.createCultivo = async (req, res) => {
    const { nombre_cultivo, descripcion_cultivo } = req.body;
    try {
        const id = await Cultivo.create(nombre_cultivo, descripcion_cultivo);
        res.status(201).json({ message: 'Cultivo creado exitosamente', id });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El nombre del cultivo ya existe' });
        }
        res.status(500).json({ message: 'Error al crear cultivo', error: error.message });
    }
};

// Actualizar un cultivo existente
exports.updateCultivo = async (req, res) => {
    const { id } = req.params;
    const { nombre_cultivo, descripcion_cultivo } = req.body;

    try {
        const affectedRows = await Cultivo.update(id, nombre_cultivo, descripcion_cultivo);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Cultivo no encontrado para actualizar' });
        }
        res.json({ message: 'Cultivo actualizado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El nombre del cultivo ya existe' });
        }
        res.status(500).json({ message: 'Error al actualizar cultivo', error: error.message });
    }
};

// Eliminar un cultivo
exports.deleteCultivo = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await Cultivo.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Cultivo no encontrado para eliminar' });
        }
        res.json({ message: 'Cultivo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cultivo', error: error.message });
    }
};
