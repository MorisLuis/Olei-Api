import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';
import { dbConnection } from '../../database';
import { drawHeader } from '../../shared/pdf/drawHeader';
import { drawInformationSection } from '../../shared/pdf/drawInformationSection';
import { drawDetailsTable } from '../../shared/pdf/drawDetailsTable';
import type { SellReportParameters, SellReportServiceResponse } from './types';
import { sellsProductsQuery } from '../../database/querys/sellsProducts';
import { sellsQuery } from '../../database/querys/sells';
import { formateDate } from '../../utils/formateDate';


const sellsReportService = async ({
    Id_Almacen,
    TipoDoc,
    Serie,
    Folio,
    Id_Cliente,
    session
}: SellReportParameters): Promise<SellReportServiceResponse> => {

    const { ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL } = session;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    const query = sellsQuery.getSellById;
    const requestSell = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .input('TipoDoc', TipoDoc)
        .input('Serie', Serie)
        .input('Folio', Folio)
        .query(query);

    const sell = requestSell.recordset[0];

    if (!sell) {
        throw new Error(`No se encontró la venta  con ID: ${Id_Cliente}`);
    }

    const getSellsDetailsByFolioQuery = sellsProductsQuery.getSellsDetailsByFolio;
    const requestSellsProducts = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .input('TipoDoc', TipoDoc)
        .input('Serie', Serie)
        .input('Folio', Folio)
        .query(getSellsDetailsByFolioQuery);

    const sellsProducts = requestSellsProducts.recordset;

    const sellsData = sellsProducts.map(product => ({
        sku: product.Codigo,
        quntity: product.Cantidad,
        description: product.Descripcion,
        unitPrice: product.Precio,
        subtotal: product.Importe
    }));

    const { pdfBuffer, fileName } = await sellsReportPdf({
        client: {
            name: sell.Nombre.trim(),
            date: formateDate(sell.Fecha),
            address: `${sell.Calle.trim()} ${sell.NoExt.trim()} ${sell.NoInt.trim()}, ${sell.Colonia.trim()}, ${sell.CodigoPost.trim()}`,
            phoneNumber: sell.Telefono1.trim(),
            email: sell.CorreoVtas.trim(),
            seller: sell.Vendedor
        },
        sells: sellsData
    });

    return {
        pdfBuffer,
        blob: pdfBuffer.toString('base64'),
        fileName,
        mimeType: 'application/pdf',
    };
}

interface sellsReportPdfParams {
    client: {
        name: string;
        date: string;
        address: string;
        phoneNumber: string;
        email: string;
        seller: string;
    },
    sells: {
        sku: string;
        quntity: number;
        description: string;
        unitPrice: number;
        subtotal: number;
    }[]
}   

const sellsReportPdf = async ({ client, sells }: sellsReportPdfParams): Promise<SellReportServiceResponse> => {

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
        company: client.name,
    });
    y = headerBottomY;

    const { y: detailsBottomY } = await drawInformationSection({
        page,
        pdfDoc,
        pageWidth,
        startY: y,
        data: [
            { label: 'CLIENTE', value: client.name },
            { label: 'FECHA', value: client.date },
            { label: 'DIRECCIÓN', value: client.address },
            { label: 'TELÉFONO', value: client.phoneNumber },
            { label: 'EMAIL', value: client.email },
            { label: 'VENDEDOR', value: client.seller }
        ],
        title: 'DATOS DEL CLIENTE',
        marginLeft,
        marginRight,
    });
    y = detailsBottomY;

    const tableAvailableWidth = pageWidth - marginLeft - marginRight;
    const baseColumnWidth = tableAvailableWidth / 6;

    await drawDetailsTable({
        page,
        pdfDoc,
        pageWidth,
        startY: y,
        headers: ['SKU', 'Cantidad', 'Descripción', 'Precio Unitario', 'Subtotal'],
        rows: sells.map(sell => [sell.sku, sell.quntity, sell.description, sell.unitPrice, sell.subtotal]),
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

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const fileName = `reporte-venta-${client.name}-${client.date}.pdf`;

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