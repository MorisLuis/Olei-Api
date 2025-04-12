import type { Request, Response } from 'express';
import { dbConnectionWeb } from '../database';
import type { ConnectionPool } from 'mssql';
import ExcelJS from 'exceljs'
import { NotFoundError } from '../errors/CustomError';
import type { SellsInterface } from '../interface/sells';
import { cobranzaQuery } from '../database/querys/cobranza';

const getBanner = (req: Request, res: Response) : Response | void => {

    const userSession = req.sessionWeb;

    const database = userSession?.BaseSQL
    const databaseSplit = database?.split('_')
    const newPath = databaseSplit?.[1]?.toLowerCase().trim();
    const banner = newPath ? `https://oleistorage.blob.core.windows.net/${newPath}/BANNER.png` : '/Banner_olei.png';

    res.json({
        banner
    });
}


const getExcellTest = async (req: Request, res: Response) : Promise<Response | void> => {

    const userSession = req.sessionWeb;

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    try {
        // Obtenemos los datos de la base de datos en lotes
        const data = await fetchDataInBatches(pool);

        // Generamos el archivo Excel y lo enviamos como respuesta
        await generateExcelStream(res, data);
    } catch (error) {
        throw new NotFoundError(`${error}`)
    }

};

const fetchDataInBatches = async (pool: ConnectionPool): Promise<SellsInterface[]> => {
    let offset = 1;
    let results: SellsInterface[] = [];
    const batchSize = 1000;
    let moreData = true;

    while (moreData) {

        const Id_Cliente = 1;
        const SellsOrderCondition = 'Fecha';

        const FilterTipoDoc = 0;
        const FilterExpired = 0;
        const FilterNotExpired = 0;
        const DateStart = undefined;
        const DateEnd = undefined;
        const DateExactly = undefined;
        const TipoDoc = 0;


        try {
            let query = cobranzaQuery.getCobranza;
            const res = await pool.request()
                .input('PageNumber', offset)
                .input('PageSize', batchSize)
                .input('Id_Cliente', Id_Cliente)
                .input('OrderCondition', SellsOrderCondition)
                .input('FilterTipoDoc', FilterTipoDoc)
                .input('FilterExpired', FilterExpired)
                .input('FilterNotExpired', FilterNotExpired)
                .input('DateStart', DateStart)
                .input('DateEnd', DateEnd)
                .input('DateExactly', DateExactly)
                .input('TipoDoc', TipoDoc)
                .query(query);

            results.push(...res.recordset);  // Añadimos los datos del lote a los resultados finales

            // Si el lote trae menos registros de los solicitados, significa que no hay más datos
            if (res.recordset.length < batchSize) {
                moreData = false;
            } else {
                offset++;  // Avanzamos el offset para el siguiente lote
            }

        } catch (error) {
            throw new NotFoundError(`${error}`)
        };
    };

    return results;
}

const generateExcelStream = async (res: Response, data: SellsInterface[]) => {
    const workbook = new ExcelJS.Workbook();  // Crea una nueva instancia del libro de Excel
    const worksheet = workbook.addWorksheet('Datos');  // Añadimos una hoja llamada 'Datos'

    // Definimos las columnas en el archivo Excel
    worksheet.columns = [
        { header: 'Codigo', key: 'Codigo', width: 10 },
        { header: 'Descripcion', key: 'Descripcion', width: 30 },
        { header: 'Id_Familia', key: 'Id_Familia', width: 10 },
    ];

    // Añadimos los datos al archivo Excel en un flujo de escritura
    for (let i = 0; i < data.length; i++) {
        worksheet.addRow(data[i]);
    }

    // Configuramos las cabeceras para que el navegador descargue el archivo como Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="datos.xlsx"');

    // Escribimos el archivo Excel en la respuesta HTTP usando un flujo (stream)
    await workbook.xlsx.write(res);  // Se escribe directamente en la respuesta
    res.end();  // Terminamos la respuesta
};


export {
    getBanner,
    getExcellTest
};