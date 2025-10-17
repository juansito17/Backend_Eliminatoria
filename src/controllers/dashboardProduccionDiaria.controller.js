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

        // Rendimiento por Lote (ejemplo: peso total por lote para el día actual)
        const [rendimientoPorLoteResult] = await pool.query(`
            SELECT l.nombre_lote, SUM(la.peso_kg) AS peso_total_lote
            FROM labores_agricolas la
            JOIN lotes l ON la.id_lote = l.id_lote
            WHERE DATE(la.fecha_labor) = CURDATE()
            GROUP BY l.nombre_lote;
        `);
        const rendimiento_por_lote = rendimientoPorLoteResult;

        // Costo Total Aproximado (ejemplo: suma del costo aproximado de las labores de hoy)
        const [costoTotalAproximadoResult] = await pool.query(`
            SELECT SUM(costo_aproximado) AS costo_total_aproximado
            FROM labores_agricolas
            WHERE DATE(fecha_labor) = CURDATE();
        `);
        const costo_total_aproximado = costoTotalAproximadoResult[0].costo_total_aproximado || 0;

        // Definir un rendimiento óptimo por trabajador (ejemplo: 100 kg por trabajador)
        const RENDIMIENTO_OPTIMO_POR_TRABAJADOR = 100; // kg/trabajador

        let eficiencia_porcentaje = 0;
        if (trabajadores_activos > 0) {
            const productividad_por_trabajador = total_peso_kg / trabajadores_activos;
            eficiencia_porcentaje = (productividad_por_trabajador / RENDIMIENTO_OPTIMO_POR_TRABAJADOR) * 100;
            // Asegurarse de que la eficiencia no supere el 100% si así se desea, o permitirlo como "extra eficiente"
            eficiencia_porcentaje = Math.min(eficiencia_porcentaje, 100); 
        }
        
        res.json({
            total_peso_kg: parseFloat(total_peso_kg).toFixed(2),
            trabajadores_activos: parseInt(trabajadores_activos),
            cultivos_activos: parseInt(cultivos_activos),
            rendimiento_por_lote: rendimiento_por_lote,
            costo_total_aproximado: parseFloat(costo_total_aproximado).toFixed(2),
            eficiencia_porcentaje: parseFloat(eficiencia_porcentaje).toFixed(2) // Formatear a 2 decimales
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


// Obtener datos históricos y estadísticas avanzadas
exports.getHistoricalData = async (req, res) => {
    try {
        const { periodo = 'semanal' } = req.query; // 'diario', 'semanal', 'mensual'

        let groupByClause;
        let selectClause;

        if (periodo === 'semanal') {
            selectClause = 'CONCAT(YEAR(fecha_labor), "-W", WEEK(fecha_labor)) as periodo';
            groupByClause = 'CONCAT(YEAR(fecha_labor), "-W", WEEK(fecha_labor))';
        } else if (periodo === 'mensual') {
            selectClause = 'DATE_FORMAT(fecha_labor, "%Y-%m") as periodo';
            groupByClause = 'DATE_FORMAT(fecha_labor, "%Y-%m")';
        } else { // 'diario'
            selectClause = 'DATE(fecha_labor) as periodo';
            groupByClause = 'DATE(fecha_labor)';
        }

        const [historicalData] = await pool.query(`
            SELECT
                ${selectClause},
                SUM(peso_kg) AS total_peso_kg,
                COUNT(DISTINCT id_trabajador) AS trabajadores_unicos,
                AVG(peso_kg / DATEDIFF(CURDATE(), fecha_labor)) AS productividad_promedio_dia,
                SUM(costo_aproximado) AS costo_total_aproximado
            FROM labores_agricolas
            GROUP BY ${groupByClause}
            ORDER BY periodo DESC;
        `);

        // Aquí se podrían añadir cálculos de variación, proyecciones, etc.
        // Por ahora, se devuelve la data agregada por el período seleccionado.

        res.json(historicalData);

    } catch (error) {
        console.error('Error al obtener datos históricos del dashboard:', error);
        res.status(500).json({ message: 'Error al obtener datos históricos del dashboard', error: error.message });
    }
};
