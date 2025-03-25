"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const currency_1 = require("./currency");
const tipoDocFormat_1 = require("./tipoDocFormat");
// Función auxiliar para truncar texto
const truncateText = (text, maxWidth, font, fontSize) => {
    let truncated = text;
    while (font.widthOfTextAtSize(truncated, fontSize) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    if (truncated !== text && truncated.length > 3) {
        truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
};
const generatePDF = async (sells) => {
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    // Parámetros de la página
    const pageWidth = 600;
    const pageHeight = 800;
    const marginLeft = 50;
    let y = pageHeight - 50;
    const headerFontSize = 10; // Reducido para que quepa mejor
    const rowFontSize = 10;
    const rowHeight = 20;
    // Definir anchos máximos para cada columna
    const maxWidths = {
        fecha: 70, // Reducido un poco
        folio: 40, // Folio debe ser pequeño
        tipoDoc: 80, // Mantenerlo legible
        fechaEntrega: 110, // Se amplió
        expiredDays: 100, // Reducido un poco
        saldo: 90, // Ajustado para que no salga
    };
    // Definir posiciones fijas para cada columna en base a los anchos
    const columns = {
        fecha: marginLeft, // 50
        folio: marginLeft + maxWidths.fecha, // 50 + 80 = 130
        tipoDoc: marginLeft + maxWidths.fecha + maxWidths.folio, // 50 + 80 + 50 = 180
        fechaEntrega: marginLeft + maxWidths.fecha + maxWidths.folio + maxWidths.tipoDoc, // 50+80+50+70 = 250
        expiredDays: marginLeft + maxWidths.fecha + maxWidths.folio + maxWidths.tipoDoc + maxWidths.fechaEntrega, // 50+80+50+70+100 = 350
        saldo: marginLeft + maxWidths.fecha + maxWidths.folio + maxWidths.tipoDoc + maxWidths.fechaEntrega + maxWidths.expiredDays, // 50+80+50+70+100+60 = 410
    };
    // Agregar la primera página
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    // Cabecera de la tabla: definir textos y sus posiciones
    const headerTexts = [
        { text: 'Fecha', x: columns.fecha },
        { text: 'Folio', x: columns.folio },
        { text: 'Tipo de Documento', x: columns.tipoDoc },
        { text: 'Fecha de Vencimiento', x: columns.fechaEntrega },
        { text: 'Días vencidos', x: columns.expiredDays },
        { text: 'Saldo', x: columns.saldo },
    ];
    // Dibujar fondo para la cabecera
    page.drawRectangle({
        x: marginLeft - 5,
        y: y - 5,
        width: pageWidth - marginLeft * 2 + 10,
        height: rowHeight,
        color: (0, pdf_lib_1.rgb)(0.9, 0.9, 0.9),
    });
    headerTexts.forEach(col => {
        const key = col.text.toLowerCase().includes('fecha de vencimiento')
            ? 'fechaEntrega'
            : col.text.toLowerCase().includes('fecha')
                ? 'fecha'
                : col.text.toLowerCase().includes('folio')
                    ? 'folio'
                    : col.text.toLowerCase().includes('tipo')
                        ? 'tipoDoc'
                        : col.text.toLowerCase().includes('días')
                            ? 'expiredDays'
                            : 'saldo';
        const truncatedHeader = truncateText(col.text, maxWidths[key], helveticaBoldFont, headerFontSize);
        page.drawText(truncatedHeader, {
            x: col.x,
            y: y,
            size: headerFontSize,
            font: helveticaBoldFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
    });
    y -= rowHeight + 5;
    // Función auxiliar para añadir nueva página con cabecera
    const addNewPage = () => {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 50;
        page.drawRectangle({
            x: marginLeft - 5,
            y: y - 5,
            width: pageWidth - marginLeft * 2 + 10,
            height: rowHeight,
            color: (0, pdf_lib_1.rgb)(0.9, 0.9, 0.9),
        });
        headerTexts.forEach(col => {
            const key = col.text.toLowerCase().includes('fecha de vencimiento')
                ? 'fechaEntrega'
                : col.text.toLowerCase().includes('fecha')
                    ? 'fecha'
                    : col.text.toLowerCase().includes('folio')
                        ? 'folio'
                        : col.text.toLowerCase().includes('tipo')
                            ? 'tipoDoc'
                            : col.text.toLowerCase().includes('días')
                                ? 'expiredDays'
                                : 'saldo';
            const truncatedHeader = truncateText(col.text, maxWidths[key], helveticaBoldFont, headerFontSize);
            page.drawText(truncatedHeader, {
                x: col.x,
                y: y,
                size: headerFontSize,
                font: helveticaBoldFont,
                color: (0, pdf_lib_1.rgb)(0, 0, 0)
            });
        });
        y -= rowHeight + 5;
    };
    // Función para formatear la fecha en DD-MM-YYYY
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        const date = new Date(dateStr);
        const dd = date.getDate().toString().padStart(2, '0');
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };
    // Dibujar cada fila de datos
    for (let i = 0; i < sells.length; i++) {
        const sell = sells[i];
        const fecha = formatDate(sell.Fecha);
        const fechaEntrega = sell.FechaEntrega ? formatDate(sell.FechaEntrega) : 'Sin Fecha de entrega';
        const saldo = `${(0, currency_1.formatCurrency)(sell.Saldo)}`;
        const tipoDoc = (0, tipoDocFormat_1.formatTipoDoc)(sell.TipoDoc);
        const diasVencidos = sell.ExpiredDays ? sell.ExpiredDays : 'N/A';
        // Si no hay espacio, añadir nueva página
        if (y < 50) {
            addNewPage();
        }
        // Dibujar fondo alternado para filas alternas
        if (i % 2 === 0) {
            page.drawRectangle({
                x: marginLeft - 5,
                y: y - 5,
                width: pageWidth - marginLeft * 2 + 10,
                height: rowHeight,
                color: (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95),
            });
        }
        // Dibujar cada columna, truncando si excede el ancho máximo
        const fechaText = truncateText(fecha, maxWidths.fecha, helveticaFont, rowFontSize);
        page.drawText(fechaText, {
            x: columns.fecha,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        const folioText = truncateText(sell.Folio.toString(), maxWidths.folio, helveticaFont, rowFontSize);
        page.drawText(folioText, {
            x: columns.folio,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        const tipoDocText = truncateText(tipoDoc, maxWidths.tipoDoc, helveticaFont, rowFontSize);
        page.drawText(tipoDocText, {
            x: columns.tipoDoc,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        const fechaEntregaText = truncateText(fechaEntrega, maxWidths.fechaEntrega, helveticaFont, rowFontSize);
        page.drawText(fechaEntregaText, {
            x: columns.fechaEntrega,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        const expiredText = truncateText(diasVencidos ? diasVencidos.toString() : '', maxWidths.expiredDays, helveticaFont, rowFontSize);
        page.drawText(expiredText, {
            x: columns.expiredDays,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        const saldoText = truncateText(saldo, maxWidths.saldo, helveticaFont, rowFontSize);
        page.drawText(saldoText, {
            x: columns.saldo,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0)
        });
        y -= rowHeight;
    }
    return await pdfDoc.save();
};
exports.generatePDF = generatePDF;
//# sourceMappingURL=generatePDF.js.map