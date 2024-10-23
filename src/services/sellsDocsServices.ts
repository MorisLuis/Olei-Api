import { dbConnection } from "../database";
import { sellsQuery } from "../database/querys/sells";
import BadRequestError from "../errors/BadRequestError";
import { handleGetWebSession } from "../utils/Redis/getSession";


const getSellsDocsService = async (
    sessionId: string,
    PageNumber: number,
    TipoDoc: 1 | 2 | 4
) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) throw new Error('Sesion terminada');

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getDocFromSells;
    const request = await pool.request()
        .input('TipoDoc', TipoDoc)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);

    const quotes = request.recordset

    return quotes
};


const getSellsDocService = async (
    sessionId: string,
    folio: string,
    TipoDoc: 1 | 2 | 4
) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) throw new Error('Sesion terminada');

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getQuote;
    const request = await pool.request()
        .input('TipoDoc', TipoDoc)
        .input('Folio', folio)
        .query(query);

    const quote = request.recordset[0]
    return quote
}

export {
    getSellsDocsService,
    getSellsDocService
}