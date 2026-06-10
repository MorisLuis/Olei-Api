
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Buffer } from 'buffer';
import { sellsQuery } from '../../database/querys/sells';
import { dbConnection } from '../../database';
import type { UserWebSessionInterface } from '../../interface/user';

interface SellReportServiceResponse {
    pdfBuffer: Buffer;
    blob: string;
    fileName: string;
    mimeType: 'application/pdf';
}

interface SellReportParameters {
    Id_Almacen: number;
    TipoDoc: string;
    Serie: string;
    Folio: string;
    Id_Cliente: number;
    session: UserWebSessionInterface,
}

const sellsReportService = async ({
    Id_Almacen,
    TipoDoc,
    Serie,
    Folio,
    Id_Cliente,
    session
}: SellReportParameters): Promise<SellReportServiceResponse> => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const query = sellsQuery.getSellReportById;
    const { ServidorSQL, BaseSQL,  UsuarioSQL, PasswordSQL } = session;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    const requestSells = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .input('TipoDoc', TipoDoc)
        .input('Serie', Serie)
        .input('Folio', Folio)
        .input('Id_Cliente', Id_Cliente)
        .query(query);

    const sells = requestSells.recordset[0];
    
    if (!sells) {
        throw new Error(`No se encontró la venta para el folio: ${Folio}`);
    }

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginLeft = 40;
    const marginRight = 40;
    const marginTop = 40;
    let y = pageHeight - marginTop;

    // ======== HEADER ========
    page.drawText('OLEI SOFTWARE', {
        x: marginLeft,
        y: y,
        size: 24,
        font: boldFont,
        color: rgb(0.12, 0.12, 0.12),
    });
    y -= 25;

    page.drawText('Reporte de Venta', {
        x: marginLeft,
        y: y,
        size: 14,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
    });
    y -= 20;

    // ======== DOCUMENT INFO ========
    page.drawRectangle({
        x: marginLeft,
        y: y - 60,
        width: pageWidth - marginLeft - marginRight,
        height: 60,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
    });

    const infoBoxY = y - 10;
    page.drawText(`Tipo: ${TipoDoc} | Serie: ${Serie ?? 'N/D'} | Folio: ${Folio}`, {
        x: marginLeft + 10,
        y: infoBoxY,
        size: 11,
        font: boldFont,
        color: rgb(0.12, 0.12, 0.12),
    });

    page.drawText(`Fecha: ${new Date(sells.Fecha).toLocaleDateString('es-MX')} | Estado: ${sells.Estado}`, {
        x: marginLeft + 10,
        y: infoBoxY - 18,
        size: 10,
        font: regularFont,
        color: rgb(0.22, 0.22, 0.22),
    });

    page.drawText(`Cliente: ${sells.Id_Cliente} | Almacén: ${sells.Id_Almacen}`, {
        x: marginLeft + 10,
        y: infoBoxY - 33,
        size: 10,
        font: regularFont,
        color: rgb(0.22, 0.22, 0.22),
    });

    y -= 75;

    // ======== TRANSACTION DETAILS ========
    const detailsData = [
        { label: 'Subtotal:', value: `$${(sells.Subtotal || 0).toFixed(2)}` },
        { label: 'Impuesto:', value: `$${(sells.Impuesto || 0).toFixed(2)}` },
        { label: 'Total:', value: `$${(sells.Total || 0).toFixed(2)}`, bold: true },
        { label: 'Saldo:', value: `$${(sells.Saldo || 0).toFixed(2)}` },
    ];

    const detailsLabelX = marginLeft;
    const detailsValueX = pageWidth - marginRight - 150;

    detailsData.forEach((detail) => {
        const font = detail.bold ? boldFont : regularFont;
        const size = detail.bold ? 12 : 10;
        
        page.drawText(detail.label, {
            x: detailsLabelX,
            y: y,
            size,
            font,
            color: rgb(0.12, 0.12, 0.12),
        });

        page.drawText(detail.value, {
            x: detailsValueX,
            y: y,
            size,
            font,
            color: rgb(0.12, 0.12, 0.12),
        });

        y -= 16;
    });

    y -= 10;

    // ======== ADDITIONAL DETAILS ========
    page.drawText('Información adicional', {
        x: marginLeft,
        y: y,
        size: 12,
        font: boldFont,
        color: rgb(0.12, 0.12, 0.12),
    });
    y -= 18;

    const additionalInfo = [
        { label: 'Piezas:', value: sells.Piezas || '0' },
        { label: 'Moneda:', value: sells.Moneda === 1 ? 'MXN' : 'USD' },
        { label: 'Tipo desc.:', value: sells.Id_Descuento || 'N/D' },
        { label: 'Cond. venta:', value: sells.Id_CondVta || 'N/D' },
        { label: 'Usuario:', value: sells.Id_Usuario || 'N/D' },
        { label: 'Estatus:', value: sells.SwPagada === 1 ? 'PAGADA' : 'PENDIENTE' },
        { label: 'Entrega:', value: sells.FechaEntrega ? new Date(sells.FechaEntrega).toLocaleDateString('es-MX') : 'N/D' },
    ];

    const col1X = marginLeft;
    const col2X = marginLeft + 200;

    for (let i = 0; i < additionalInfo.length; i += 2) {
        page.drawText(additionalInfo[i].label, {
            x: col1X,
            y: y,
            size: 9,
            font: boldFont,
            color: rgb(0.22, 0.22, 0.22),
        });

        page.drawText(String(additionalInfo[i].value), {
            x: col1X + 100,
            y: y,
            size: 9,
            font: regularFont,
            color: rgb(0.3, 0.3, 0.3),
        });

        if (i + 1 < additionalInfo.length) {
            page.drawText(additionalInfo[i + 1].label, {
                x: col2X,
                y: y,
                size: 9,
                font: boldFont,
                color: rgb(0.22, 0.22, 0.22),
            });

            page.drawText(String(additionalInfo[i + 1].value), {
                x: col2X + 100,
                y: y,
                size: 9,
                font: regularFont,
                color: rgb(0.3, 0.3, 0.3),
            });
        }

        y -= 14;
    }

    y -= 15;

    // ======== NOTES ========
    if (sells.Notas) {
        page.drawText('Notas', {
            x: marginLeft,
            y: y,
            size: 11,
            font: boldFont,
            color: rgb(0.12, 0.12, 0.12),
        });
        y -= 16;

        page.drawText(sells.Notas, {
            x: marginLeft + 10,
            y: y,
            size: 9,
            font: regularFont,
            color: rgb(0.35, 0.35, 0.35),
            maxWidth: pageWidth - marginLeft - marginRight - 20,
        });
        y -= 30;
    }

    // ======== FOOTER ========
    y = 30;
    page.drawText(`Generado: ${new Date().toLocaleString('es-MX')}`, {
        x: marginLeft,
        y: y,
        size: 8,
        font: regularFont,
        color: rgb(0.6, 0.6, 0.6),
    });

    page.drawText(`Almacén: ${Id_Almacen} | Cliente: ${Id_Cliente}`, {
        x: pageWidth - marginRight - 200,
        y: y,
        size: 8,
        font: regularFont,
        color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const fileName = `reporte-venta-${Folio}-${TipoDoc}.pdf`;

    return {
        pdfBuffer,
        blob: pdfBuffer.toString('base64'),
        fileName,
        mimeType: 'application/pdf',
    };
}

export {
    sellsReportService
}