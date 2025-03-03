"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const generatePDF = async (sells) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]); // 🔹 Usa let para permitir reasignación
    const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const titleFontSize = 18;
    const textFontSize = 12;
    let y = 750; // Posición inicial en la página
    // Título
    page.drawText('Reporte de Cobranza', {
        x: 50,
        y,
        size: titleFontSize,
        font,
        color: (0, pdf_lib_1.rgb)(0, 0, 0),
    });
    y -= 30; // Espaciado
    // Encabezados de la tabla
    const headers = ['Folio', 'Fecha', 'Saldo', 'Total'];
    const colWidths = [100, 150, 100, 100];
    headers.forEach((header, i) => {
        page.drawText(header, {
            x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            size: textFontSize,
            font,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
    });
    y -= 20; // Espaciado para los datos
    console.log({ sells });
    // Agregar datos de sells
    sells.forEach(sell => {
        if (y < 50) {
            // Nueva página si no hay espacio
            page = pdfDoc.addPage([600, 800]); // 🔹 Reasignación permitida con let
            y = 750;
        }
        const row = [
            sell.Folio.toString(),
            new Date(sell.Fecha).toLocaleDateString(),
            `$${sell.Saldo.toFixed(2)}`,
            `$${sell.Total.toFixed(2)}`
        ];
        row.forEach((text, i) => {
            page.drawText(text, {
                x: 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
                y,
                size: textFontSize,
                font,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
        });
        y -= 20; // Espaciado entre filas
    });
    return await pdfDoc.save();
};
exports.generatePDF = generatePDF;
//# sourceMappingURL=generatePDF.js.map