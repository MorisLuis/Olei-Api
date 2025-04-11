import type { ConnectionPool } from "mssql";
import type { SellsInterface, SellsOrderConditionType } from "../interface/sells";
import ExcelJS from 'exceljs';
import type { Response } from "express";
import excelColumnsConfig from "../utils/excelColumnsConfig";
import { createPool } from "../helpers/createPool";
import { NotFoundError, UnauthorizedError, ValidationError } from "../errors/CustomError";
import type { UserWebSessionInterface } from "../interface/user";
import { cobranzaQuery } from "../database/querys/cobranza";

interface reportsCobranzaServiceInterface {
    userSession?: UserWebSessionInterface,
    PageNumber: number,
    Id_Cliente: number,
    SellsOrderCondition: SellsOrderConditionType | string,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterTipoDoc: 0 | 1,
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
    res: Response
};

const reportsCobranzaService = async ({
    userSession,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart,
    res
}: reportsCobranzaServiceInterface): Promise<void> => {

    if (!userSession) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { ServidorSQL, BaseSQL } = userSession;

    const pool = await createPool(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const data = await fetchDataInBatches({
        pool,
        PageNumber,
        Id_Cliente,
        SellsOrderCondition,
        FilterTipoDoc,
        FilterExpired,
        FilterNotExpired,
        TipoDoc,
        DateEnd,
        DateExactly,
        DateStart,
        res
    });

    await generateExcelStream(res, data)
};


interface fetchDataInBatchesInterface extends reportsCobranzaServiceInterface {
    pool: ConnectionPool;
}

const fetchDataInBatches = async ({
    pool,
    Id_Cliente,
    SellsOrderCondition,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: fetchDataInBatchesInterface): Promise<SellsInterface[]> => {

    let offset = 1;
    let results: SellsInterface[] = [];
    const batchSize = 1000;
    let moreData = true;

    while (moreData) {

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

            results.push(...res.recordset);

            if (res.recordset.length < batchSize) {
                moreData = false;
            } else {
                offset++;
            }

        } catch (error) {
            throw new NotFoundError(`${error}`)
        };
    };

    return results;
}

const generateExcelStream = async (res: Response, data: SellsInterface[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');
    worksheet.columns = excelColumnsConfig.cobranza

    for (let i = 0; i < data.length; i++) {
        worksheet.addRow(data[i]);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="datos.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
};

export {
    reportsCobranzaService
}