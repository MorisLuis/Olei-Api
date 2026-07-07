import { Buffer } from 'buffer';
import { PDFDocument } from "pdf-lib";

import { drawDetailsTable } from "../../../shared/pdf/drawDetailsTable";
import { drawHeader } from "../../../shared/pdf/drawHeader";
import { drawInformationSection } from "../../../shared/pdf/drawInformationSection";
import { drawSellReportFooter } from './drawSellReportFooter';
import { drawSellReportTableFooter } from './drawSellReportTableFooter';
import type { sellsReportPdfParams } from "./types";
import type { SellReportServiceResponse } from "../types";
import { formatCurrency } from '../../../utils/currency';

export const createSellsReportPdf = async ({ sellDetails, sells }: sellsReportPdfParams): Promise<SellReportServiceResponse> => {

    // Set up the PDF document and page
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginLeft = 40;
    const marginRight = 40;
    const marginTop = 40;
    let y = pageHeight - marginTop;

    const { y: headerBottomY } = await drawHeader({
        title: 'Reporte de Venta',
        page,
        pdfDoc,
        pageWidth: 595.28,
        pageHeight: 841.89,
        marginLeft,
        marginRight,
        company: sellDetails.name,
    });
    y = headerBottomY;

    const { y: detailsBottomY } = await drawInformationSection({
        page,
        pdfDoc,
        pageWidth,
        startY: y,
        data: [
            { label: 'CLIENTE', value: sellDetails.name },
            { label: 'FECHA', value: sellDetails.date },
            { label: 'DIRECCIÓN', value: sellDetails.address },
            { label: 'TELÉFONO', value: sellDetails.phoneNumber },
            { label: 'EMAIL', value: sellDetails.email },
            { label: 'VENDEDOR', value: sellDetails.seller }
        ],
        title: 'DATOS DEL CLIENTE',
        marginLeft,
        marginRight,
    });
    y = detailsBottomY;

    const tableAvailableWidth = pageWidth - marginLeft - marginRight;
    const baseColumnWidth = tableAvailableWidth / 6;

    const { y: detailsTableBottomY } = await drawDetailsTable({
        page,
        pdfDoc,
        pageWidth,
        startY: y,
        headers: ['SKU', 'Cantidad', 'Descripción', 'Precio Unitario', 'Subtotal'],
        rows: sells.map(sell => [sell.sku, sell.quntity, sell.description, formatCurrency(sell.unitPrice), formatCurrency(sell.subtotal)]),
        marginLeft,
        marginRight,
        columnWidths: [
            baseColumnWidth,
            baseColumnWidth,
            baseColumnWidth * 2,
            baseColumnWidth,
            baseColumnWidth,
        ],
    });

    const pagesAfterTable = pdfDoc.getPages();
    const tableLastPage = pagesAfterTable[pagesAfterTable.length - 1];

    const { page: footerTablePage, y: tableFooterBottomY } = await drawSellReportTableFooter({
        page: tableLastPage,
        pdfDoc,
        pageWidth,
        pageHeight,
        startY: detailsTableBottomY + 8,
        marginLeft,
        marginRight,
        ivaLabel: `IVA: ${formatCurrency(sellDetails.iva)}`,
        subtotalLabel: `Subtotal: ${formatCurrency(sellDetails.subtotal)}`,
        totalLabel: `Total: ${formatCurrency(sellDetails.total)}`,
    });

    await drawSellReportFooter({
        page: footerTablePage,
        pdfDoc,
        pageWidth,
        pageHeight,
        startY: tableFooterBottomY,
        marginLeft,
        marginRight,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const fileName = `reporte-venta-${sellDetails.name}-${sellDetails.date}.pdf`;

    return {
        pdfBuffer,
        blob: pdfBuffer.toString('base64'),
        fileName,
        mimeType: 'application/pdf',
    };
}