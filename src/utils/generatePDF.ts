import type { PDFFont } from 'pdf-lib';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SellsInterface } from '../interface/sells';
import { formatCurrency } from './currency';
import { formatTipoDoc } from './tipoDocFormat';
import type { totalCobranzaResponse } from '../services/cobranza/cobranza.interface';

// Función auxiliar para truncar texto
const truncateText = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string => {
    let truncated = text;
    while (font.widthOfTextAtSize(truncated, fontSize) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
    }
    if (truncated !== text && truncated.length > 3) {
        truncated = truncated.slice(0, -3) + '...';
    }
    return truncated;
};

const generatePDF = async (
    sells: SellsInterface[],
    briefSells: totalCobranzaResponse
): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Parámetros de la página
    const pageWidth = 600;
    const pageHeight = 800;
    const marginLeft = 50;
    let y = pageHeight - 50;
    const headerFontSize = 10;
    const rowFontSize = 10;
    const rowHeight = 20;

    // Definir anchos máximos para cada columna
    const maxWidths = {
        fecha: 70,
        folio: 40,
        tipoDoc: 80,
        fechaEntrega: 110,
        expiredDays: 100,
        saldo: 90,
    };

    // Definir posiciones fijas para cada columna en base a los anchos
    const columns = {
        fecha: marginLeft,
        folio: marginLeft + maxWidths.fecha,
        tipoDoc: marginLeft + maxWidths.fecha + maxWidths.folio,
        fechaEntrega:
            marginLeft + maxWidths.fecha + maxWidths.folio + maxWidths.tipoDoc,
        expiredDays:
            marginLeft +
            maxWidths.fecha +
            maxWidths.folio +
            maxWidths.tipoDoc +
            maxWidths.fechaEntrega,
        saldo:
            marginLeft +
            maxWidths.fecha +
            maxWidths.folio +
            maxWidths.tipoDoc +
            maxWidths.fechaEntrega +
            maxWidths.expiredDays,
    };

    // Agregar la primera página
    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Cabecera de la tabla
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
        color: rgb(0.9, 0.9, 0.9),
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
            color: rgb(0, 0, 0),
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
            color: rgb(0.9, 0.9, 0.9),
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
                color: rgb(0, 0, 0),
            });
        });
        y -= rowHeight + 5;
    };

    // Función para formatear la fecha en DD-MM-YYYY
    const formatDate = (dateStr?: string): string => {
        if (!dateStr) return '';
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
        const saldo = `${formatCurrency(sell.Saldo)}`;
        const tipoDoc = formatTipoDoc(sell.TipoDoc);
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
                color: rgb(0.95, 0.95, 0.95),
            });
        }

        // Dibujar cada columna, truncando si excede el ancho máximo
        const fechaText = truncateText(fecha, maxWidths.fecha, helveticaFont, rowFontSize);
        page.drawText(fechaText, {
            x: columns.fecha,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        const folioText = truncateText(sell.Folio.toString(), maxWidths.folio, helveticaFont, rowFontSize);
        page.drawText(folioText, {
            x: columns.folio,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        const tipoDocText = truncateText(tipoDoc, maxWidths.tipoDoc, helveticaFont, rowFontSize);
        page.drawText(tipoDocText, {
            x: columns.tipoDoc,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        const fechaEntregaText = truncateText(fechaEntrega, maxWidths.fechaEntrega, helveticaFont, rowFontSize);
        page.drawText(fechaEntregaText, {
            x: columns.fechaEntrega,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        const expiredText = truncateText(diasVencidos.toString(), maxWidths.expiredDays, helveticaFont, rowFontSize);
        page.drawText(expiredText, {
            x: columns.expiredDays,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        const saldoText = truncateText(saldo, maxWidths.saldo, helveticaFont, rowFontSize);
        page.drawText(saldoText, {
            x: columns.saldo,
            y: y,
            size: rowFontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        y -= rowHeight;
    }

    // Agregar la fila de totales al final; si no hay espacio, se añade una nueva página
    if (y < 50) addNewPage();
    const totalRowY = y;
    const saldoVencido = `${formatCurrency(briefSells.SumaSaldoVencido)}`;
    const saldoNoVencido = `${formatCurrency(briefSells.SumaSaldoNoVencido)}`;
    const totalSaldo = `${formatCurrency(briefSells.SumaTotalSaldo)}`;

    // Dibujar "Totales" a la izquierda
    page.drawText('Totales', {
        x: marginLeft,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
    });

    // Separar los grupos y calcular sus anchos:
    const gapBetweenGroups = 20; // espacio entre cada grupo

    const group1Label = 'Saldo Vencido: ';
    const group1Value = saldoVencido;
    const group2Label = 'Saldo No Vencido: ';
    const group2Value = saldoNoVencido;
    const group3Label = 'Total Saldo: ';
    const group3Value = totalSaldo;

    const group1Width = helveticaBoldFont.widthOfTextAtSize(group1Label, rowFontSize) +
                          helveticaFont.widthOfTextAtSize(group1Value, rowFontSize);
    const group2Width = helveticaBoldFont.widthOfTextAtSize(group2Label, rowFontSize) +
                          helveticaFont.widthOfTextAtSize(group2Value, rowFontSize);
    const group3Width = helveticaBoldFont.widthOfTextAtSize(group3Label, rowFontSize) +
                          helveticaFont.widthOfTextAtSize(group3Value, rowFontSize);

    // Sumar anchos y gaps para posicionar desde la derecha
    const totalGroupsWidth = group1Width + gapBetweenGroups + group2Width + gapBetweenGroups + group3Width;
    const rightXBase = pageWidth - marginLeft - totalGroupsWidth;

    // Empezar a dibujar desde la posición calculada
    let currentX = rightXBase;

    // Grupo 1: Saldo Vencido
    page.drawText(group1Label, {
        x: currentX,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
    });
    currentX += helveticaBoldFont.widthOfTextAtSize(group1Label, rowFontSize);
    page.drawText(group1Value, {
        x: currentX,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });
    currentX += helveticaFont.widthOfTextAtSize(group1Value, rowFontSize) + gapBetweenGroups;

    // Grupo 2: Saldo No Vencido
    page.drawText(group2Label, {
        x: currentX,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
    });
    currentX += helveticaBoldFont.widthOfTextAtSize(group2Label, rowFontSize);
    page.drawText(group2Value, {
        x: currentX,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });
    currentX += helveticaFont.widthOfTextAtSize(group2Value, rowFontSize) + gapBetweenGroups;

    // Grupo 3: Total Saldo
    page.drawText(group3Label, {
        x: currentX,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
    });
    currentX += helveticaBoldFont.widthOfTextAtSize(group3Label, rowFontSize);
    page.drawText(group3Value, {
        x: currentX,
        y: totalRowY,
        size: rowFontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    // Finalizar y retornar el PDF
    return await pdfDoc.save();
};

export default generatePDF;
