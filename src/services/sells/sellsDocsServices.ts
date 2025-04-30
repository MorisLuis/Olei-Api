import { dbConnectionWeb } from "../../database";
import { sellsQuery } from "../../database/querys/sells";
import { ValidationError } from "../../errors/CustomError";
import type { SellsInterface, SellsOrderConditionType } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";
import type { getSellsByClientServiceInterface, getTotalSellsByClientServiceInterface } from "./sellsDocsServices.interface";


const getSellsService = async (
    userSession: UserWebSessionInterface,
    PageNumber: number,
    sellsOrderCondition: SellsOrderConditionType | string,
    searchTerm: string
): Promise<{ sells: SellsInterface[], count: number, total: { SumaSubtotal: number, SumaTotal: number } }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsQuery.getSells;
    const totalSellsQuery = sellsQuery.getSellsTotal;
    const countSellsQuery = sellsQuery.getSellsCount;

    const requestSells = await pool.request()
        .input('OrderCondition', sellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('searchTerm', searchTerm)
        .query(query);

    const requestTotal = await pool.request()
        .input('OrderCondition', sellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('searchTerm', searchTerm)
        .query(totalSellsQuery);

    const requestCount = pool.request()
        .input('searchTerm', searchTerm)
        .query(countSellsQuery);


    const [sellsResult, countResult, totalResult] = await Promise.all([
        requestSells,
        requestCount,
        requestTotal
    ]);

    return {
        sells: sellsResult.recordset,
        count: Number(countResult.recordset[0]?.TotalCount ?? 0),
        total: totalResult.recordset[0]
    };
};

const getSellsByClientService = async ({
    userSession,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: getSellsByClientServiceInterface): Promise<{ sells: SellsInterface[], total: number }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsQuery.getSellsByClient;
    const totalSellsQuery = sellsQuery.getTotalSellsByClient;

    const requestSells = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const requestTotal = pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(totalSellsQuery);

    const [sellsResult, totalResult] = await Promise.all([
        requestSells,
        requestTotal
    ]);

    return {
        sells: sellsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    };
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

const getTotalSellsByClientService = async ({
    userSession,
    Id_Cliente,
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
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
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


export {
    getSellsService,
    getSellsByClientService,
    getSellByIdService,
    getTotalSellsByClientService
}