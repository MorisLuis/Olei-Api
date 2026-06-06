
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Buffer } from 'buffer';
import type { UserWebSessionInterface } from '../../interface/user';

interface SellReportServiceResponse {
    pdfBuffer: Buffer;
    blob: string;
    fileName: string;
    mimeType: 'application/pdf';
}

const sellsReportService = async (
    session: UserWebSessionInterface,
    id: string
): Promise<SellReportServiceResponse> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Olei - Basic Sell Report', {
        x: 50,
        y: 790,
        size: 20,
        font: boldFont,
        color: rgb(0.12, 0.12, 0.12),
    });

    page.drawText(`Folio / ID: ${id}`, {
        x: 50,
        y: 750,
        size: 13,
        font: regularFont,
        color: rgb(0.22, 0.22, 0.22),
    });

    page.drawText(`Company: ${session.Nombre}`, {
        x: 50,
        y: 730,
        size: 13,
        font: regularFont,
        color: rgb(0.22, 0.22, 0.22),
    });

    page.drawText(`Generated at: ${new Date().toISOString()}`, {
        x: 50,
        y: 710,
        size: 11,
        font: regularFont,
        color: rgb(0.35, 0.35, 0.35),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const fileName = `sell-report-${id}.pdf`;

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