import { dbConnectionWeb } from "../../database";
import { cobranzaQuery } from "../../database/querys/cobranza";
import { ValidationError } from "../../errors/CustomError";
import type { SellsInterface } from "../../interface/sells";
import type { CobranzaInterface, CobranzaInterfaceByClient, GetCobranzaByClientParamsWithPagination, GetCobranzaByClientInterface, GetCobranzaInterface } from "./cobranza.interface";


const getCobranzaService = async ({
    userSession,
    SellsOrderCondition,
    termSearch,
    PageSize = 10,
    PageNumber
}: GetCobranzaInterface): Promise<{ cobranza: CobranzaInterfaceByClient[], total: number }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = cobranzaQuery.getCobranza;
    const totalCobranzaQuery = cobranzaQuery.getTotalCobranza;

    const requestCobranza = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('nombre', termSearch)
        .input('OrderCondition', SellsOrderCondition)
        .query(query);

    const requestTotal = pool.request()
        .input('nombre', termSearch)
        .query(totalCobranzaQuery);

    const [sellsResult, totalResult] = await Promise.all([
        requestCobranza,
        requestTotal
    ]);

    return {
        cobranza: sellsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    }

};

const getCobranzaByClientService = async ({
    userSession,
    PageNumber,
    PageSize = 10,
    SellsOrderCondition,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart,
    Id_Cliente,
    Id_Almacen
}: GetCobranzaByClientParamsWithPagination): Promise<{ cobranza: SellsInterface[], total: number }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = cobranzaQuery.getCobranzaByClient;
    const totalCobranzaByClientQuery = cobranzaQuery.getTotalCobranzaByClient;

    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(query);

    const requestTotal = await pool.request()
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(totalCobranzaByClientQuery);

    const [sellsResult, totalResult] = await Promise.all([
        request,
        requestTotal
    ]);

    return {
        cobranza: sellsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    }
};

const getTotalCobranzaService = async ({
    userSession,
    Id_Cliente,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetCobranzaByClientInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = cobranzaQuery.getTotalCobranza;
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

const getCobranzaWithTotalsService = async ({
    userSession,
    Id_Cliente,
    FilterExpired,
    FilterNotExpired,
    SellsOrderCondition,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetCobranzaByClientInterface): Promise<{ brief: CobranzaInterface }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };
    let query = cobranzaQuery.getCobranzaWithTotals;

    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('OrderCondition', SellsOrderCondition)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const recordsets = Array.isArray(request.recordsets) ? request.recordsets : Object.values(request.recordsets);
    const brief = recordsets[0][0] as CobranzaInterface;

    return {
        brief
    }
};

export {
    getCobranzaByClientService,
    getCobranzaService,
    getCobranzaWithTotalsService,
    getTotalCobranzaService
}