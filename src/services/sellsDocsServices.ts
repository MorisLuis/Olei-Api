import { dbConnection } from "../database";
import { sellsQuery } from "../database/querys/sells";
import BadRequestError from "../errors/BadRequestError";
import { SellsInterface, SellsOrderConditionType } from "../interface/sells";
import { handleGetWebSession } from "../utils/Redis/getSession";


const getSellsService = async (
    sessionId: string,
    PageNumber: number,
    SellsOrderCondition: SellsOrderConditionType | string
) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getSells;
    const request = await pool.request()
        .input('OrderCondition', SellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);

    const sells = request.recordset

    return sells
};

export interface getSellsByClientServiceInterface {
    sessionId: string,
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
};

const getSellsByClientService = async ({
    sessionId,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getSellsByClientServiceInterface) => {


    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }
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
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const sells = request.recordset
    return sells
};

const getSellByIdService = async (sessionId: string, folio: string, Serie: string, Id_Cliente: number, Id_Almacen: number, TipoDoc: SellsInterface['TipoDoc']) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }
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

    const sell = request.recordset
    return sell
};

interface getCobranzaInterface {
    sessionId: string,
    PageNumber: number,
    Id_Cliente: number,
    SellsOrderCondition: SellsOrderConditionType | string,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterTipoDoc: 0 | 1
};

const getCobranzaService = async ({
    sessionId,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    FilterTipoDoc,
    TipoDoc
}: getCobranzaInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getCobranza;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const sells = request.recordset
    return sells
};

const getTotalSellsService = async (sessionId: string) => {
    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getTotalSells;
    const request = await pool.request()
        .query(query);

    const total = request.recordset[0].TotalCount
    return total
};

interface getTotalSellsByClientServiceInterface {
    sessionId: string,
    Id_Cliente: number,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterTipoDoc: 0 | 1,
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
};

const getTotalSellsByClientService = async ({
    sessionId,
    Id_Cliente,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getTotalSellsByClientServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getTotalSellsByClient;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

        const total = request.recordset[0].TotalCount
        return total
};

interface getTotalCobranzaServiceInterface {
    sessionId: string;
    Id_Cliente: number;
    FilterTipoDoc: 0 | 1;
    TipoDoc: SellsInterface['TipoDoc']
}

const getTotalCobranzaService = async ({
    sessionId,
    Id_Cliente,
    FilterTipoDoc,
    TipoDoc
}: getTotalCobranzaServiceInterface ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = sellsQuery.getTotalCobranza;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const sells = request.recordset
    return sells
}

export {
    getSellsService,
    getSellsByClientService,
    getSellByIdService,
    getCobranzaService,
    getTotalSellsService,
    getTotalSellsByClientService,
    getTotalCobranzaService
}