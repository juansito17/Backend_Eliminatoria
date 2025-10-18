const pool = require('../config/database');
const Trabajador = require('../models/trabajador.model');

// Obtener todos los trabajadores (filtrado por rol/usuario)
exports.getTrabajadores = async (req, res) => {
    try {
        // Si no viene info de usuario, denegar (esta ruta debería estar protegida por auth)
        if (!req.user || !(req.user.id_usuario || req.user.id) || !req.user.rol) {
            return res.status(401).json({ message: 'No autenticado o información de usuario incompleta' });
        }

        const userId = req.user.id_usuario || req.user.id;
        const userRol = Number(req.user.rol);

        let trabajadores = [];

        if (userRol === 1) {
            // Admin: todos los trabajadores
            trabajadores = await Trabajador.findAll();
        } else if (userRol === 2) {
            // Supervisor: trabajadores asignados a su cargo (supervisor_trabajador)
            const [rows] = await pool.query(
                `SELECT t.id_trabajador, t.nombre_completo
                 FROM trabajadores t
                 INNER JOIN supervisor_trabajador st ON st.id_trabajador = t.id_trabajador
                 WHERE st.id_supervisor = ? AND st.activo = 1 AND t.activo = 1`,
                [userId]
            );
            trabajadores = rows;
        } else if (userRol === 3) {
            // Operario: solo su trabajador vinculado
            const [rows] = await pool.query(
                `SELECT id_trabajador, nombre_completo
                 FROM trabajadores
                 WHERE id_usuario = ? AND activo = 1
                 LIMIT 1`,
                [userId]
            );
            trabajadores = rows;
        } else {
            // Roles desconocidos: devolver vacío por seguridad
            trabajadores = [];
        }

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
