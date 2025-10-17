const DashboardProduccionDiaria = require('../models/dashboardProduccionDiaria.model');

// Obtener todos los registros de producción diaria
exports.getDashboardProduccionDiaria = async (req, res) => {
    try {
        const registros = await DashboardProduccionDiaria.findAll();
        res.json(registros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registros de producción diaria', error: error.message });
    }
};

// Obtener un registro de producción diaria por ID
exports.getDashboardProduccionDiariaById = async (req, res) => {
    const { id } = req.params;
    try {
        const registro = await DashboardProduccionDiaria.findById(id);
        if (!registro) {
            return res.status(404).json({ message: 'Registro de producción diaria no encontrado' });
        }
        res.json(registro);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener registro de producción diaria', error: error.message });
    }
};

// Crear un nuevo registro de producción diaria
exports.createDashboardProduccionDiaria = async (req, res) => {
    const { fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado } = req.body;
    try {
        const id = await DashboardProduccionDiaria.create(fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado);
        res.status(201).json({ message: 'Registro de producción diaria creado exitosamente', id });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear registro de producción diaria', error: error.message });
    }
};

// Actualizar un registro de producción diaria existente
exports.updateDashboardProduccionDiaria = async (req, res) => {
    const { id } = req.params;
    const { fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado } = req.body;

    try {
        const affectedRows = await DashboardProduccionDiaria.update(id, fecha, id_lote, id_cultivo, total_peso_kg, productividad_promedio_trabajador, costo_total_aproximado);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Registro de producción diaria no encontrado para actualizar' });
        }
        res.json({ message: 'Registro de producción diaria actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar registro de producción diaria', error: error.message });
    }
};

// Eliminar un registro de producción diaria
exports.deleteDashboardProduccionDiaria = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await DashboardProduccionDiaria.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Registro de producción diaria no encontrado para eliminar' });
        }
        res.json({ message: 'Registro de producción diaria eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar registro de producción diaria', error: error.message });
    }
};
