import { Request, Response } from 'express';
import { dbConnectionMain, querys } from '../database';
import sql from 'mssql';
import moment from 'moment';
import { NotFoundError } from '../errors/CustomError';

const handleErrors = async (req: Request, res: Response) : Promise<Response | void> => {

    try {
        const pool = await dbConnectionMain();
        const { From, Message, Id_Usuario, Metodo, code } = req.body;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        let query = querys.postError;
        const fechaActualCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');

        await request
            .input('From', sql.VarChar, From || '')
            .input('Message', sql.VarChar, Message || '')
            .input('Id_Usuario', sql.VarChar, Id_Usuario || '')
            .input('Fecha', sql.VarChar,fechaActualCDMX)
            .input('Metodo', sql.VarChar, Metodo || '')
            .input('code', sql.VarChar, code || '')
            .query(query);

        await transaction.commit();

        return res.json({
            ok: true
        })

    } catch (error) {
        return res.status(500).send(error);
    }

};

interface handleErrorsEndpointInterface {
    From: string,
    Message: string,
    Id_Usuario: string,
    Metodo: string,
    code: string
};

const handleErrorsEndpoint = async ({
    From,
    Message,
    Id_Usuario,
    Metodo,
    code
}: handleErrorsEndpointInterface)  : Promise<Response | void> => {


    try {
        const pool = await dbConnectionMain();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);

        let query = querys.postError;
        const fechaActualCDMX = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');

        await request
            .input('From', sql.VarChar, From || '')
            .input('Message', sql.VarChar, Message || '')
            .input('Id_Usuario', sql.VarChar, Id_Usuario || '')
            .input('Fecha', sql.VarChar,fechaActualCDMX)
            .input('Metodo', sql.VarChar, Metodo || '')
            .input('code', sql.VarChar, code || '')
            .query(query);

        await transaction.commit();

    } catch (error) {
        throw new NotFoundError(`Error al conectarse a base de datos principal: ${error}`);
    }

}

export {
    handleErrors,
    handleErrorsEndpoint
}