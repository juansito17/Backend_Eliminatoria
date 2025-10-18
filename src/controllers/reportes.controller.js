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
        // Obtener datos
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
                u.nombre_usuario AS usuario_registro
            FROM labores_agricolas la
            JOIN labores_tipos lt ON la.id_labor_tipo = lt.id_labor_tipo
            JOIN cultivos c ON la.id_cultivo = c.id_cultivo
            JOIN lotes l ON la.id_lote = l.id_lote
            JOIN trabajadores t ON la.id_trabajador = t.id_trabajador
            JOIN usuarios u ON la.id_usuario_registro = u.id_usuario
            ORDER BY la.fecha_labor DESC;
        `);

        // Crear documento PDF con márgenes y tamaño A4
        const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

        let filename = 'reporte_labores_agricolas.pdf';
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        // Opcional: agregar logo si existe en /public/logo.png
        try {
            const fs = require('fs');
            const path = require('path');
            const logoPath = path.join(__dirname, '..', '..', 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, doc.page.width - 120, 30, { width: 80, height: 40 });
            }
        } catch (e) {
            // Ignorar si no hay logo o falla al leer
        }

        // Header
        doc
            .fillColor('#0f172a')
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('Sistema Agrícola Inteligente', doc.page.margins.left, doc.y, { align: 'left' });

        // Subheader: pequeño indent para separarlo visualmente del borde
        const subheaderIndent = doc.page.margins.left + 12;
        doc
            .fontSize(12)
            .font('Helvetica')
            .fillColor('#475569')
            .text('Reporte de Labores Agrícolas', subheaderIndent, doc.y + 6, { align: 'left' });

        const generatedAt = new Date();
        doc.fontSize(10).fillColor('#6b7280').text(`Generado: ${generatedAt.toLocaleString()}`, { align: 'right' });

        doc.moveDown(1.2);

        // Tabla: definir posiciones y anchos
        const tableTop = doc.y + 5;
        const columnWidths = {
            fecha: 80,
            labor: 100,
            cultivo: 90,
            lote: 80,
            trabajador: 110,
            cantidad: 70,
            peso: 60,
            costo: 70
        };

        // Dibujar encabezado de tabla
        doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#0f172a');

        let x = doc.page.margins.left;
        const headerY = tableTop;
        doc.text('Fecha', x, headerY, { width: columnWidths.fecha, align: 'left' });
        x += columnWidths.fecha;
        doc.text('Labor', x, headerY, { width: columnWidths.labor, align: 'left' });
        x += columnWidths.labor;
        doc.text('Cultivo', x, headerY, { width: columnWidths.cultivo, align: 'left' });
        x += columnWidths.cultivo;
        doc.text('Lote', x, headerY, { width: columnWidths.lote, align: 'left' });
        x += columnWidths.lote;
        doc.text('Trabajador', x, headerY, { width: columnWidths.trabajador, align: 'left' });
        x += columnWidths.trabajador;
        doc.text('Cant.', x, headerY, { width: columnWidths.cantidad, align: 'right' });
        x += columnWidths.cantidad;
        doc.text('Peso', x, headerY, { width: columnWidths.peso, align: 'right' });
        x += columnWidths.peso;
        doc.text('Costo', x, headerY, { width: columnWidths.costo, align: 'right' });

        // Línea separadora
        doc.moveTo(doc.page.margins.left, headerY + 16).lineTo(doc.page.width - doc.page.margins.right, headerY + 16).strokeColor('#e5e7eb').stroke();

        // Reset fuente para filas
        doc.font('Helvetica').fontSize(10).fillColor('#111827');

        let y = headerY + 22;
        const rowHeight = 20;
        labores.forEach((labor, idx) => {
            // Paginar si se sale del área util de la página
                if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 50) {
                // Añadir nueva página y volver a dibujar encabezado de forma consistente
                doc.addPage();

                // volver a dibujar encabezado en nueva página usando una posición base consistente
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
                x = doc.page.margins.left;
                const headerYNew = doc.y + 10;

                doc.text('Fecha', x, headerYNew, { width: columnWidths.fecha, align: 'left' });
                x += columnWidths.fecha;
                doc.text('Labor', x, headerYNew, { width: columnWidths.labor, align: 'left' });
                x += columnWidths.labor;
                doc.text('Cultivo', x, headerYNew, { width: columnWidths.cultivo, align: 'left' });
                x += columnWidths.cultivo;
                doc.text('Lote', x, headerYNew, { width: columnWidths.lote, align: 'left' });
                x += columnWidths.lote;
                doc.text('Trabajador', x, headerYNew, { width: columnWidths.trabajador, align: 'left' });
                x += columnWidths.trabajador;
                doc.text('Cant.', x, headerYNew, { width: columnWidths.cantidad, align: 'right' });
                x += columnWidths.cantidad;
                doc.text('Peso', x, headerYNew, { width: columnWidths.peso, align: 'right' });
                x += columnWidths.peso;
                doc.text('Costo', x, headerYNew, { width: columnWidths.costo, align: 'right' });

                // Línea separadora usando mismas coordenadas que el encabezado original
                const lineY = headerYNew + 16;
                doc.moveTo(doc.page.margins.left, lineY).lineTo(doc.page.width - doc.page.margins.right, lineY).strokeColor('#e5e7eb').stroke();

                // Posicionar y para las filas debajo del encabezado
                y = headerYNew + 22;
                doc.font('Helvetica').fontSize(10).fillColor('#111827');
            }

            // Alternar fondo de fila
            if (idx % 2 === 0) {
                doc.rect(doc.page.margins.left, y - 2, doc.page.width - doc.page.margins.left - doc.page.margins.right, rowHeight).fillOpacity(0.03).fill('#000000').fillOpacity(1);
            }

            x = doc.page.margins.left;
            const fechaText = labor.fecha_labor ? new Date(labor.fecha_labor).toLocaleDateString() : '';
            doc.fillColor('#111827').text(fechaText, x, y, { width: columnWidths.fecha, align: 'left' });
            x += columnWidths.fecha;
            doc.text(labor.nombre_labor || '', x, y, { width: columnWidths.labor, align: 'left' });
            x += columnWidths.labor;
            doc.text(labor.nombre_cultivo || '', x, y, { width: columnWidths.cultivo, align: 'left' });
            x += columnWidths.cultivo;
            doc.text(labor.nombre_lote || '', x, y, { width: columnWidths.lote, align: 'left' });
            x += columnWidths.lote;
            doc.text(labor.trabajador || '', x, y, { width: columnWidths.trabajador, align: 'left' });
            x += columnWidths.trabajador;
            doc.text(String(labor.cantidad_recolectada || 0), x, y, { width: columnWidths.cantidad, align: 'right' });
            x += columnWidths.cantidad;
            doc.text(String(labor.peso_kg || 0), x, y, { width: columnWidths.peso, align: 'right' });
            x += columnWidths.peso;
            doc.text(String(labor.costo_aproximado || 0), x, y, { width: columnWidths.costo, align: 'right' });

            // Restaurar relleno a blanco para siguientes elementos
            doc.fillColor('#111827');
            y += rowHeight;
        });

        // Pie de página: número de página
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            const bottom = doc.page.height - doc.page.margins.bottom + 10;
            doc.fontSize(9).fillColor('#6b7280').text(`Página ${i + 1} de ${pageCount}`, doc.page.margins.left, bottom, {
                align: 'center',
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right
            });
        }

        // Emitir PDF al cliente
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
                u.nombre_usuario AS usuario_registro
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
