import { dbConnection } from '../../database';
import type { SellReportParameters, SellReportServiceResponse } from './types';
import { sellsProductsQuery } from '../../database/querys/sellsProducts';
import { sellsQuery } from '../../database/querys/sells';
import { formateDate } from '../../utils/formateDate';
import { createSellsReportPdf } from './utils/createSellsReportPdf';

const generateReportSells = async ({
    Id_Almacen,
    TipoDoc,
    Serie,
    Folio,
    Id_Cliente,
    session
}: SellReportParameters): Promise<SellReportServiceResponse> => {

    const { ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL } = session;
    const pool = await dbConnection(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);

    console.log({ Id_Almacen, TipoDoc, Serie, Folio, Id_Cliente });

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

    const { pdfBuffer, fileName } = await createSellsReportPdf({
        sellDetails: {
            name: sell.Nombre.trim(),
            date: formateDate(sell.Fecha),
            address: `${sell.Calle.trim()} ${sell.NoExt.trim()} ${sell.NoInt.trim()}, ${sell.Colonia.trim()}, ${sell.CodigoPost.trim()}`,
            phoneNumber: sell.Telefono1.trim(),
            email: sell.CorreoVtas.trim(),
            seller: sell.Vendedor,
            iva: sell.Impuesto,
            subtotal: sell.Subtotal,
            total: sell.Total
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


export {
    generateReportSells
}