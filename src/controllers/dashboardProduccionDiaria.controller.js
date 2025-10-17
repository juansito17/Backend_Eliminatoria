const pool = require('../config/database'); // Importar el pool de conexiones a la base de datos
const { getIo } = require('../socket'); // Importar la instancia de Socket.io

// Obtener datos agregados para el dashboard
exports.getDashboardProduccionDiaria = async (req, res) => {
    try {
        // Producción Diaria (ejemplo: suma del peso de las labores de hoy)
        const [produccionDiariaResult] = await pool.query(`
            SELECT SUM(peso_kg) AS total_peso_kg
            FROM labores_agricolas
            WHERE DATE(fecha_labor) = CURDATE();
        `);
        const total_peso_kg = produccionDiariaResult[0].total_peso_kg || 0;

        // Trabajadores Activos (ejemplo: contar trabajadores con labores hoy)
        const [trabajadoresActivosResult] = await pool.query(`
            SELECT COUNT(DISTINCT id_trabajador) AS trabajadores_activos
            FROM labores_agricolas
            WHERE DATE(fecha_labor) = CURDATE();
        `);
        const trabajadores_activos = trabajadoresActivosResult[0].trabajadores_activos || 0;

        // Cultivos Activos (ejemplo: contar cultivos con labores hoy)
        const [cultivosActivosResult] = await pool.query(`
            SELECT COUNT(DISTINCT id_cultivo) AS cultivos_activos
            FROM labores_agricolas
            WHERE DATE(fecha_labor) = CURDATE();
        `);
        const cultivos_activos = cultivosActivosResult[0].cultivos_activos || 0;

        // Eficiencia (ejemplo: un valor fijo o calculado de forma más compleja)
        // Por simplicidad, se puede definir un valor de ejemplo o implementar una lógica más avanzada.
        const eficiencia_porcentaje = 94.2; // Valor de ejemplo

        res.json({
            total_peso_kg: parseFloat(total_peso_kg).toFixed(2),
            trabajadores_activos: parseInt(trabajadores_activos),
            cultivos_activos: parseInt(cultivos_activos),
            eficiencia_porcentaje: eficiencia_porcentaje
        });

    } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({ message: 'Error al obtener datos del dashboard', error: error.message });
    }
};

// Las siguientes funciones (getDashboardProduccionDiariaById, createDashboardProduccionDiaria, updateDashboardProduccionDiaria, deleteDashboardProduccionDiaria)
// ya no son relevantes para el concepto de un "dashboard de producción diaria" que agrega datos.
// Si se necesitan operaciones CRUD para registros individuales de producción diaria, se deberían mover a un controlador y modelo diferente
// o adaptar este controlador para manejar ambos tipos de solicitudes de manera clara.
// Por ahora, las eliminamos para evitar confusiones y mantener el enfoque en los datos agregados del dashboard.

// Si se requieren operaciones CRUD para "produccion diaria", se debe crear un nuevo controlador y modelo para ello.
// Este controlador se centrará exclusivamente en los datos agregados del dashboard.
