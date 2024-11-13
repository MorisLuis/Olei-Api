import { dbConnection } from "../database";
import { sellsQuery } from "../database/querys/sells";
import BadRequestError from "../errors/BadRequestError";
import { SellsFilterCondition, SellsInterface, SellsOrderCondition } from "../interface/sells";
import { handleGetWebSession } from "../utils/Redis/getSession";


const getSellsService = async (
    sessionId: string,
    PageNumber: number,
    SellsOrderCondition?: SellsOrderCondition
) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) throw new Error('Sesion terminada');

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getSells;
    console.log({PageNumber})
    const request = await pool.request()
        .input('OrderCondition', SellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);

    const quotes = request.recordset

    return quotes
};

interface getSellsByClientServiceInterface {
    sessionId: string,
    PageNumber: number,
    Id_Cliente: number,
    SellsOrderCondition?: SellsOrderCondition,
    SellsFilterCondition?: SellsFilterCondition,
    TipoDoc?: SellsInterface['TipoDoc']
}

const getSellsByClientService = async ({
    sessionId,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    SellsFilterCondition,
    TipoDoc
}: getSellsByClientServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) throw new Error('Sesion terminada');

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getSellsByClient;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition ?? '')
        .input('WhereCondition', SellsFilterCondition ?? '') 
        .input('TipoDoc', TipoDoc)
        .query(query);

    const quote = request.recordset
    return quote
}


const getSellByIdService = async (sessionId: string, folio: string, Serie: string, Id_Cliente: number, Id_Almacen: number, TipoDoc: SellsInterface['TipoDoc'] ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) throw new Error('Sesion terminada');

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getSellById;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .input('Serie', Serie)
        .input('Folio', folio)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const quote = request.recordset
    return quote
}
export {
    getSellsService,
    getSellsByClientService,
    getSellByIdService
}