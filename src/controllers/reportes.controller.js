const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Función para obtener producción diaria agregada
exports.getProduccionDiaria = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, cultivoId, laborId, trabajadorId } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (fechaInicio) {
            whereConditions.push('la.fecha_labor >= ?');
            queryParams.push(fechaInicio);
        }
        if (fechaFin) {
            whereConditions.push('la.fecha_labor <= ?');
            queryParams.push(fechaFin);
        }
        if (cultivoId) {
            whereConditions.push('la.id_cultivo = ?');
            queryParams.push(cultivoId);
        }
        if (laborId) {
            whereConditions.push('la.id_labor_tipo = ?');
            queryParams.push(laborId);
        }
        if (trabajadorId) {
            whereConditions.push('la.id_trabajador = ?');
            queryParams.push(trabajadorId);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const [rows] = await pool.query(`
            SELECT
                DATE(la.fecha_labor) as fecha,
                SUM(la.cantidad_recolectada) as cantidad_total,
                SUM(la.peso_kg) as peso_total,
                COUNT(*) as numero_labores,
                c.nombre_cultivo
            FROM labores_agricolas la
            JOIN cultivos c ON la.id_cultivo = c.id_cultivo
            ${whereClause}
            GROUP BY DATE(la.fecha_labor), c.nombre_cultivo
            ORDER BY fecha DESC
        `, queryParams);

        // Mapear los campos para que coincidan con lo que espera el frontend
        const produccionFormateada = rows.map(row => ({
            fecha: row.fecha,
            cantidad_total: parseFloat(row.cantidad_total || 0),
            peso_total: parseFloat(row.peso_total || 0),
            numero_labores: parseInt(row.numero_labores || 0),
            nombre_cultivo: row.nombre_cultivo
        }));

        res.json(produccionFormateada);
    } catch (error) {
        console.error('Error al obtener producción diaria:', error);
        res.status(500).json({ message: 'Error al obtener producción diaria', error: error.message });
    }
};

// Función para obtener rendimiento por lote
exports.getRendimientoLote = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, cultivoId, laborId, trabajadorId } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (fechaInicio) {
            whereConditions.push('la.fecha_labor >= ?');
            queryParams.push(fechaInicio);
        }
        if (fechaFin) {
            whereConditions.push('la.fecha_labor <= ?');
            queryParams.push(fechaFin);
        }
        if (cultivoId) {
            whereConditions.push('la.id_cultivo = ?');
            queryParams.push(cultivoId);
        }
        if (laborId) {
            whereConditions.push('la.id_labor_tipo = ?');
            queryParams.push(laborId);
        }
        if (trabajadorId) {
            whereConditions.push('la.id_trabajador = ?');
            queryParams.push(trabajadorId);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const [rows] = await pool.query(`
            SELECT
                l.nombre_lote,
                c.nombre_cultivo,
                SUM(la.cantidad_recolectada) as cantidad_total,
                SUM(la.peso_kg) as peso_total,
                AVG(la.cantidad_recolectada) as promedio_cantidad,
                COUNT(*) as numero_labores
            FROM labores_agricolas la
            JOIN cultivos c ON la.id_cultivo = c.id_cultivo
            JOIN lotes l ON la.id_lote = l.id_lote
            ${whereClause}
            GROUP BY l.nombre_lote, c.nombre_cultivo
            ORDER BY peso_total DESC
        `, queryParams);

        // Mapear los campos para que coincidan con lo que espera el frontend
        const rendimientoFormateado = rows.map(row => ({
            nombre_lote: row.nombre_lote,
            nombre_cultivo: row.nombre_cultivo,
            cantidad_total: parseFloat(row.cantidad_total || 0),
            peso_total: parseFloat(row.peso_total || 0),
            promedio_cantidad: parseFloat(row.promedio_cantidad || 0),
            numero_labores: parseInt(row.numero_labores || 0)
        }));

        res.json(rendimientoFormateado);
    } catch (error) {
        console.error('Error al obtener rendimiento por lote:', error);
        res.status(500).json({ message: 'Error al obtener rendimiento por lote', error: error.message });
    }
};

// Función para obtener eficiencia por trabajador
exports.getEficienciaTrabajador = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, cultivoId, laborId, trabajadorId } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (fechaInicio) {
            whereConditions.push('la.fecha_labor >= ?');
            queryParams.push(fechaInicio);
        }
        if (fechaFin) {
            whereConditions.push('la.fecha_labor <= ?');
            queryParams.push(fechaFin);
        }
        if (cultivoId) {
            whereConditions.push('la.id_cultivo = ?');
            queryParams.push(cultivoId);
        }
        if (laborId) {
            whereConditions.push('la.id_labor_tipo = ?');
            queryParams.push(laborId);
        }
        if (trabajadorId) {
            whereConditions.push('la.id_trabajador = ?');
            queryParams.push(trabajadorId);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const [rows] = await pool.query(`
            SELECT
                t.nombre_completo as trabajador,
                COUNT(*) as numero_labores,
                SUM(la.cantidad_recolectada) as cantidad_total,
                SUM(la.peso_kg) as peso_total,
                AVG(la.cantidad_recolectada) as promedio_cantidad,
                SUM(la.costo_aproximado) as costo_total
            FROM labores_agricolas la
            JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
            ${whereClause}
            GROUP BY t.nombre_completo
            ORDER BY peso_total DESC
        `, queryParams);

        // Mapear los campos para que coincidan con lo que espera el frontend
        const eficienciaFormateada = rows.map(row => ({
            trabajador: row.trabajador,
            numero_labores: parseInt(row.numero_labores || 0),
            cantidad_total: parseFloat(row.cantidad_total || 0),
            peso_total: parseFloat(row.peso_total || 0),
            promedio_cantidad: parseFloat(row.promedio_cantidad || 0),
            costo_total: parseFloat(row.costo_total || 0)
        }));

        res.json(eficienciaFormateada);
    } catch (error) {
        console.error('Error al obtener eficiencia por trabajador:', error);
        res.status(500).json({ message: 'Error al obtener eficiencia por trabajador', error: error.message });
    }
};

// Función para obtener histórico de labores
exports.getHistoricoLabores = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, cultivoId, laborId, trabajadorId } = req.query;

        let whereConditions = [];
        let queryParams = [];

        if (fechaInicio) {
            whereConditions.push('la.fecha_labor >= ?');
            queryParams.push(fechaInicio);
        }
        if (fechaFin) {
            whereConditions.push('la.fecha_labor <= ?');
            queryParams.push(fechaFin);
        }
        if (cultivoId) {
            whereConditions.push('la.id_cultivo = ?');
            queryParams.push(cultivoId);
        }
        if (laborId) {
            whereConditions.push('la.id_labor_tipo = ?');
            queryParams.push(laborId);
        }
        if (trabajadorId) {
            whereConditions.push('la.id_trabajador = ?');
            queryParams.push(trabajadorId);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const [rows] = await pool.query(`
            SELECT
                DATE(la.fecha_labor) as fecha,
                lt.nombre_labor,
                COUNT(*) as numero_labores,
                SUM(la.cantidad_recolectada) as cantidad_total,
                SUM(la.peso_kg) as peso_total
            FROM labores_agricolas la
            JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
            ${whereClause}
            GROUP BY DATE(la.fecha_labor), lt.nombre_labor
            ORDER BY fecha ASC
        `, queryParams);

        // Mapear los campos para que coincidan con lo que espera el frontend
        const historicoFormateado = rows.map(row => ({
            fecha: row.fecha,
            nombre_labor: row.nombre_labor,
            numero_labores: parseInt(row.numero_labores || 0),
            cantidad_total: parseFloat(row.cantidad_total || 0),
            peso_total: parseFloat(row.peso_total || 0)
        }));

        res.json(historicoFormateado);
    } catch (error) {
        console.error('Error al obtener histórico de labores:', error);
        res.status(500).json({ message: 'Error al obtener histórico de labores', error: error.message });
    }
};

// Función para obtener labores detalladas con filtros y paginación
exports.getLaboresDetallado = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, cultivoId, laborId, trabajadorId, page = 1, limit = 10 } = req.query;

        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 0;

        if (fechaInicio) {
            whereConditions.push(`la.fecha_labor >= ?`);
            queryParams.push(fechaInicio);
        }
        if (fechaFin) {
            whereConditions.push(`la.fecha_labor <= ?`);
            queryParams.push(fechaFin);
        }
        if (cultivoId) {
            whereConditions.push(`la.id_cultivo = ?`);
            queryParams.push(cultivoId);
        }
        if (laborId) {
            whereConditions.push(`la.id_labor_tipo = ?`);
            queryParams.push(laborId);
        }
        if (trabajadorId) {
            whereConditions.push(`la.id_trabajador = ?`);
            queryParams.push(trabajadorId);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Obtener total de registros para paginación
        const [totalRows] = await pool.query(`
            SELECT COUNT(*) as total
            FROM labores_agricolas la
            ${whereClause}
        `, queryParams);

        const offset = (page - 1) * limit;

        // Obtener datos paginados
        const [rows] = await pool.query(`
            SELECT
                la.fecha_labor,
                lt.nombre_labor,
                c.nombre_cultivo,
                l.nombre_lote,
                t.nombre_completo AS trabajador,
                la.cantidad_recolectada,
                la.peso_kg,
                la.costo_aproximado,
                u.nombre_usuario AS usuario_registro
            FROM labores_agricolas la
            JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
            JOIN cultivos c ON la.id_cultivo = c.id_cultivo
            JOIN lotes l ON la.id_lote = l.id_lote
            JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
            JOIN usuarios u ON la.id_usuario_registro = u.id_usuario
            ${whereClause}
            ORDER BY la.fecha_labor DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        // Mapear los campos para que coincidan con lo que espera el frontend
        const datosFormateados = rows.map(row => ({
            fecha_labor: row.fecha_labor,
            nombre_labor: row.nombre_labor,
            nombre_cultivo: row.nombre_cultivo,
            nombre_lote: row.nombre_lote,
            trabajador: row.trabajador,
            cantidad_recolectada: parseFloat(row.cantidad_recolectada || 0),
            peso_kg: parseFloat(row.peso_kg || 0),
            costo_aproximado: parseFloat(row.costo_aproximado || 0),
            usuario_registro: row.usuario_registro
        }));

        res.json({
            data: datosFormateados,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalRows[0].total,
                pages: Math.ceil(totalRows[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener labores detalladas:', error);
        res.status(500).json({ message: 'Error al obtener labores detalladas', error: error.message });
    }
};

// Generar reporte de labores agrícolas en PDF
exports.generateLaboresPdf = async (req, res) => {
    try {
        const [labores] = await pool.query(`
            SELECT
                la.fecha_labor,
                lt.nombre_labor,
                c.nombre_cultivo,
                l.nombre_lote,
                t.nombre_completo AS trabajador,
                la.cantidad_recolectada,
                la.peso_kg,
                la.costo_aproximado,
                u.nombre AS usuario_registro
            FROM labores_agricolas la
            JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
            JOIN cultivos c ON la.id_cultivo = c.id_cultivo
            JOIN lotes l ON la.id_lote = l.id_lote
            JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
            JOIN usuarios u ON la.id_usuario_registro = u.id_usuario
            ORDER BY la.fecha_labor DESC;
        `);

        const doc = new PDFDocument();
        let filename = 'reporte_labores_agricolas.pdf';
        // Stripping special characters
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.fontSize(16).text('Reporte de Labores Agrícolas', { align: 'center' });
        doc.moveDown();

        labores.forEach(labor => {
            doc.fontSize(12).text(`Fecha: ${labor.fecha_labor.toLocaleDateString()}`);
            doc.text(`Labor: ${labor.nombre_labor}`);
            doc.text(`Cultivo: ${labor.nombre_cultivo}`);
            doc.text(`Lote: ${labor.nombre_lote}`);
            doc.text(`Trabajador: ${labor.trabajador}`);
            doc.text(`Cantidad Recolectada: ${labor.cantidad_recolectada}`);
            doc.text(`Peso (kg): ${labor.peso_kg}`);
            doc.text(`Costo Aproximado: ${labor.costo_aproximado}`);
            doc.text(`Registrado por: ${labor.usuario_registro}`);
            doc.moveDown();
        });

        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('Error al generar reporte PDF de labores agrícolas:', error);
        res.status(500).json({ message: 'Error al generar reporte PDF', error: error.message });
    }
};

// Generar reporte de labores agrícolas en Excel
exports.generateLaboresExcel = async (req, res) => {
    try {
        const [labores] = await pool.query(`
            SELECT
                la.fecha_labor,
                lt.nombre_labor,
                c.nombre_cultivo,
                l.nombre_lote,
                t.nombre_completo AS trabajador,
                la.cantidad_recolectada,
                la.peso_kg,
                la.costo_aproximado,
                u.nombre AS usuario_registro
            FROM labores_agricolas la
            JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
            JOIN cultivos c ON la.id_cultivo = c.id_cultivo
            JOIN lotes l ON la.id_lote = l.id_lote
            JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
            JOIN usuarios u ON la.id_usuario_registro = u.id_usuario
            ORDER BY la.fecha_labor DESC;
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Labores Agrícolas');

        worksheet.columns = [
            { header: 'Fecha', key: 'fecha_labor', width: 15 },
            { header: 'Labor', key: 'nombre_labor', width: 20 },
            { header: 'Cultivo', key: 'nombre_cultivo', width: 20 },
            { header: 'Lote', key: 'nombre_lote', width: 15 },
            { header: 'Trabajador', key: 'trabajador', width: 25 },
            { header: 'Cantidad Recolectada', key: 'cantidad_recolectada', width: 20 },
            { header: 'Peso (kg)', key: 'peso_kg', width: 15 },
            { header: 'Costo Aproximado', key: 'costo_aproximado', width: 20 },
            { header: 'Usuario Registro', key: 'usuario_registro', width: 25 }
        ];

        labores.forEach(labor => {
            worksheet.addRow({
                fecha_labor: labor.fecha_labor.toLocaleDateString(),
                nombre_labor: labor.nombre_labor,
                nombre_cultivo: labor.nombre_cultivo,
                nombre_lote: labor.nombre_lote,
                trabajador: labor.trabajador,
                cantidad_recolectada: labor.cantidad_recolectada,
                peso_kg: labor.peso_kg,
                costo_aproximado: labor.costo_aproximado,
                usuario_registro: labor.usuario_registro
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'reporte_labores_agricolas.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error al generar reporte Excel de labores agrícolas:', error);
        res.status(500).json({ message: 'Error al generar reporte Excel', error: error.message });
    }
};
