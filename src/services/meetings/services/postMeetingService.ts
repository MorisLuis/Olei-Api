import sql from 'mssql';

import { dbConnectionWeb } from "../../../database";
import { ValidationError } from "../../../errors/CustomError";
import type MeetingInterface from "../../../interface/meeting";
import type { UserWebSessionInterface } from "../../../interface/user";
import { bitacoraQuerys } from '../../../database/querys/bitacora';
import { validateMeetingInput } from './utils/validateMeetingInput';


export const postMeetingService = async (
    userSession: UserWebSessionInterface,
    body: MeetingInterface
): Promise<{ result: MeetingInterface }> => {

    const { ServidorSQL, BaseSQL } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Database connection failed');
    }

    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const request = new sql.Request(transaction);

        validateMeetingInput(body);

        const normalizedDate = new Date(body.Fecha);

        const result = await request
            .input('Id_Almacen', sql.Int, body.Id_Almacen ?? null)
            .input('Id_Cliente', sql.Int, body.Id_Cliente)
            .input('Fecha', sql.Date, normalizedDate)
            .input('Hour', sql.VarChar, body.Hour)
            .input('HourEnd', sql.VarChar, body.HourEnd)
            .input('Descripcion', sql.VarChar, body.Descripcion)
            .input('TipoContacto', sql.Int, body.TipoContacto)
            .input('Comentarios', sql.VarChar, body.Comentarios ?? null)
            .input('status', sql.Bit, 1)
            .query(bitacoraQuerys.insertMeeting);

        await transaction.commit();

        return { result: result.recordset[0] };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
