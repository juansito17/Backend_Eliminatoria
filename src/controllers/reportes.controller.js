const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

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
