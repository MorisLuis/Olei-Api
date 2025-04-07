import { dbConnectionWeb } from "../database";
import { sellsQuery } from "../database/querys/sells";
import { ValidationError } from "../errors/CustomError";
import type { SellsInterface, SellsOrderConditionType } from "../interface/sells";
import type { UserWebSessionInterface } from "../interface/user";


const getSellsService = async (
    userSession: UserWebSessionInterface,
    PageNumber: number,
    SellsOrderCondition: SellsOrderConditionType | string
): Promise<SellsInterface[]> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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
    userSession: UserWebSessionInterface,
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
    DateStart
}: getSellsByClientServiceInterface): Promise<SellsInterface[]> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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

const getSellByIdService = async (
    userSession: UserWebSessionInterface,
    folio: string,
    Serie: string,
    Id_Almacen: number,
    TipoDoc: SellsInterface['TipoDoc']
): Promise<SellsInterface> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = sellsQuery.getSellById;
    const request = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .input('Serie', Serie)
        .input('Folio', folio)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const sell = request.recordset[0];

    return sell
};

interface getCobranzaInterface {
    userSession: UserWebSessionInterface,
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

    PageSize?: number
};

const getCobranzaService = async ({
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
    PageSize = 10
}: getCobranzaInterface): Promise<SellsInterface[]> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = sellsQuery.getCobranza;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
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

export const getAllCobranzaService = async (params: getCobranzaInterface): Promise<SellsInterface[]> => {
    let allSells: SellsInterface[] = [];
    let pageNumber = params.PageNumber || 1;
    const pageSize = params.PageSize || 100;
    let hasMore = true;

    while (hasMore) {
        const sellsPage = await getCobranzaService({ ...params, PageNumber: pageNumber, PageSize: pageSize });
        if (sellsPage.length > 0) {
            allSells = allSells.concat(sellsPage);
            pageNumber++;
        } else {
            hasMore = false;
        }
    }
    return allSells;
};


const getTotalSellsService = async (userSession: UserWebSessionInterface): Promise<number> => {;

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = sellsQuery.getTotalSells;
    const request = await pool.request()
        .query(query);

    const total = request.recordset[0].TotalCount
    return total
};

interface getTotalSellsByClientServiceInterface {
    userSession: UserWebSessionInterface,
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
    userSession,
    Id_Cliente,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getTotalSellsByClientServiceInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    TipoDoc?: SellsInterface['TipoDoc']
    FilterTipoDoc: 0 | 1,
    FilterExpired: 0 | 1,
    FilterNotExpired: 0 | 1,
    DateEnd: string | null,
    DateExactly: string | null,
    DateStart: string | null,
}

const getTotalCobranzaService = async ({
    userSession,
    Id_Cliente,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getTotalCobranzaServiceInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = sellsQuery.getTotalCobranza;
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