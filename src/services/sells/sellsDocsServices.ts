import { dbConnectionWeb } from "../../database";
import { sellsQuery } from "../../database/querys/sells";
import { ValidationError } from "../../errors/CustomError";
import type { SellsInterface } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";
import type { GetSellsServiceParams, GetSellsTotalServiceResponse, GetSellsByClientPaginatedServiceParams, GetSellsPaignatedServiceParams, GetSellsByClientServiceParams } from "./sellsDocsServices.interface";


const getSellsService = async ({
    userSession,
    PageNumber,
    sellsOrderCondition,
    searchTerm,

    DateEnd,
    DateExactly,
    DateStart
}: GetSellsPaignatedServiceParams): Promise<{ sells: SellsInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsQuery.getSells;

    const requestSells = await pool.request()
        .input('OrderCondition', sellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('searchTerm', searchTerm)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .query(query);

    const sells = requestSells.recordset
    return {
        sells
    };
};

const getSellsCountAndTotalService = async ({
    userSession,
    searchTerm,


    DateEnd,
    DateExactly,
    DateStart
}: GetSellsServiceParams): Promise<GetSellsTotalServiceResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const totalSellsQuery = sellsQuery.getSellsTotal;
    const countSellsQuery = sellsQuery.getSellsCount;


    const requestTotal = await pool.request()
        .input('PageSize', 10)
        .input('searchTerm', searchTerm)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .query(totalSellsQuery);

    const requestCount = await pool.request()
        .input('searchTerm', searchTerm)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .query(countSellsQuery);

    const [countResult, totalResult] = await Promise.all([
        requestCount,
        requestTotal
    ]);

    return {
        count: Number(countResult.recordset[0]?.TotalCount ?? 0),
        total: totalResult.recordset[0]
    };
};

const getSellsByClientService = async ({
    userSession,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetSellsByClientPaginatedServiceParams): Promise<{ sells: SellsInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsQuery.getSellsByClient;
    const requestSells = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);


    const [sellsResult] = await Promise.all([
        requestSells
    ]);

    return {
        sells: sellsResult.recordset
    };
};

const getSellsByClientCountAndTotalService = async ({
    userSession,
    Id_Cliente,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetSellsByClientServiceParams): Promise<GetSellsTotalServiceResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const totalSellsQuery = sellsQuery.getSellsByClientTotal;
    const countSellsQuery = sellsQuery.getSellsByClientCount;

    const requestTotal = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(totalSellsQuery);

    const requestCount = pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(countSellsQuery);


    const [sellsCountResult, sellTotalResult] = await Promise.all([
        requestCount,
        requestTotal
    ]);

    return {
        count: Number(sellsCountResult.recordset[0]?.TotalCount ?? 0),
        total: sellTotalResult.recordset[0]
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

export {
    getSellsService,
    getSellsCountAndTotalService,
    getSellsByClientService,
    getSellsByClientCountAndTotalService,
    getSellByIdService
}