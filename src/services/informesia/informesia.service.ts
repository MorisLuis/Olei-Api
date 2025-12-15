import { dbConnectionWeb } from "../../database";
import { informesiaQuery } from "../../database/querys/informesia";
import { ValidationError } from "../../errors/CustomError";
import type { UserWebSessionInterface } from "../../interface/user";
import sql from 'mssql';

interface GetInformesiaParams {
    userSession: UserWebSessionInterface;
    PageNumber: number;
}

export const getInformesiaService = async ({
    userSession,
    PageNumber
}: GetInformesiaParams) => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };


    const query = informesiaQuery.getInformesia;
    const requestInformesIA = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);

    const informesia = requestInformesIA.recordset

    return informesia
}

export const postInformesiaService = async ({
    userSession,
    body
}: any) => {

    const { ServidorSQL, BaseSQL } = userSession
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL)
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);
    const query = informesiaQuery.postInformesia;

    const { Titulo, Categoria, Descripcion, PeticionUsuario, SQL: SQLQuery } = body;

    await request
        .input('Titulo', sql.VarChar(255), Titulo)
        .input('Categoria', sql.Int, Categoria)
        .input('Descripcion', sql.Text, Descripcion || null)
        .input('PeticionUsuario', sql.Text, PeticionUsuario || null)
        .input('SQL', sql.Text, SQLQuery)
        .query(query);

    await transaction.commit();

    return
}