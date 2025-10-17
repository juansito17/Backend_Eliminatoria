const Trabajador = require('../models/trabajador.model');

// Obtener todos los trabajadores
exports.getTrabajadores = async (req, res) => {
    try {
        const trabajadores = await Trabajador.findAll();
        // Mapear los campos de la base de datos a los nombres esperados por el frontend
        const trabajadoresFormateados = trabajadores.map(trabajador => ({
            id: trabajador.id_trabajador,
            nombre: trabajador.nombre_completo
        }));
        res.json({ trabajadores: trabajadoresFormateados });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener trabajadores', error: error.message });
    }
};

// Obtener un trabajador por ID
exports.getTrabajadorById = async (req, res) => {
    const { id } = req.params;
    try {
        const trabajador = await Trabajador.findById(id);
        if (!trabajador) {
            return res.status(404).json({ message: 'Trabajador no encontrado' });
        }
        res.json(trabajador);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener trabajador', error: error.message });
    }
};

// Crear un nuevo trabajador
exports.createTrabajador = async (req, res) => {
    const { nombre_completo, codigo_trabajador } = req.body;
    try {
        const id = await Trabajador.create(nombre_completo, codigo_trabajador);
        res.status(201).json({ message: 'Trabajador creado exitosamente', id });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El código de trabajador ya existe' });
        }
        res.status(500).json({ message: 'Error al crear trabajador', error: error.message });
    }
};

// Actualizar un trabajador existente
exports.updateTrabajador = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, codigo_trabajador, activo } = req.body;

    try {
        const affectedRows = await Trabajador.update(id, nombre_completo, codigo_trabajador, activo);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Trabajador no encontrado para actualizar' });
        }
        res.json({ message: 'Trabajador actualizado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El código de trabajador ya existe' });
        }
        res.status(500).json({ message: 'Error al actualizar trabajador', error: error.message });
    }
};

// Eliminar un trabajador
exports.deleteTrabajador = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await Trabajador.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Trabajador no encontrado para eliminar' });
        }
        res.json({ message: 'Trabajador eliminado exitosamente' });
    } catch (error) {
        if (error.message.includes('ER_ROW_IS_REFERENCED_2')) {
            return res.status(409).json({ message: 'No se puede eliminar el trabajador porque tiene labores asociadas.' });
        }
        res.status(500).json({ message: 'Error al eliminar trabajador', error: error.message });
    }
};
