import { dbConnectionWeb } from "../../database";
import { cobranzaQuery } from "../../database/querys/cobranza";
import { ValidationError } from "../../errors/CustomError";
import type { SellsInterface } from "../../interface/sells";
import type { CobranzaInterface, CobranzaInterfaceByClient, GetCobranzaInterface, GetCobranzaParamsWithPagination } from "./cobranza.interface";


const getCobranzaByClientService = async ({
    userSession,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    SellsOrderCondition,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart,
    PageSize = 10,
    PageNumber
}: GetCobranzaParamsWithPagination): Promise<{ cobranza: CobranzaInterfaceByClient[] }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };
    let query = cobranzaQuery.getCobranzaByClient;

    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('OrderCondition', SellsOrderCondition)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const recordsets = Array.isArray(request.recordsets) ? request.recordsets : Object.values(request.recordsets);
    const cobranza = recordsets[0]

    return {
        cobranza
    }

};

const getCobranzaService = async ({
    userSession,
    PageNumber,
    PageSize = 10,
    Id_Cliente,
    SellsOrderCondition,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetCobranzaParamsWithPagination): Promise<SellsInterface[]> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = cobranzaQuery.getCobranza;
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
}: GetCobranzaInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = cobranzaQuery.getTotalCobranza;
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

const getCobranzaWithTotalsService = async ({
    userSession,
    Id_Cliente,
    FilterTipoDoc,
    FilterExpired,
    FilterNotExpired,
    SellsOrderCondition,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetCobranzaInterface): Promise<{ brief: CobranzaInterface }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };
    let query = cobranzaQuery.getCobranzaWithTotals;

    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
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