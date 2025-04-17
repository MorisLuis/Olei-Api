import moment from "moment";
import { dbConnectionMain, querys } from "../database";
import sql from 'mssql';
import { ValidationError } from "../errors/CustomError";

export interface ErrorLogData {
    From?: string;
    Message?: string;
    Id_Usuario?: string;
    Metodo?: string;
    code?: number | string;
}

const errorsService = async (data: ErrorLogData) => {
    const pool = await dbConnectionMain();
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
        const request = new sql.Request(transaction);
        const fechaActualCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');

        await request
            .input('From', sql.VarChar, data.From || '')
            .input('Message', sql.VarChar, data.Message || '')
            .input('Id_Usuario', sql.VarChar, data.Id_Usuario || '')
            .input('Fecha', sql.VarChar, fechaActualCDMX)
            .input('Metodo', sql.VarChar, data.Metodo || '')
            .input('code', sql.Int, data.code || '')
            .query(querys.postError);

        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

export {
    errorsService
}