import dayjs from 'dayjs';

import { dbConnectionWeb } from "../../database";
import { cobranzaQuery } from "../../database/querys/cobranza";
import { ValidationError } from "../../errors/CustomError";
import type { SellsInterface } from "../../interface/sells";
import type { GetCobranzaWithSearchParams, GetCobranzaByClientParams, GetCobranzaTotalResponse, CobranzaInterface, GetCobranzaTotalsResponse } from "./cobranza.interface";

const getCobranzaService = async ({
    userSession,
    SellsOrderCondition,
    PageSize = 10,
    PageNumber,
    termSearch
}: GetCobranzaWithSearchParams): Promise<{ cobranza: CobranzaInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = cobranzaQuery.getCobranza;

    const requestCobranza = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('nombre', termSearch)
        .input('OrderCondition', SellsOrderCondition)
        .query(query);

    return {
        cobranza: requestCobranza.recordset
    }

};


const getCobranzaCountAndTotalService = async (
    params: GetCobranzaWithSearchParams
): Promise<{ count: number; total: GetCobranzaTotalResponse }> => {
    const { userSession, termSearch, startDate, endDate, exactlyDate } = params;
    const { ServidorSQL, BaseSQL } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const normalizeDate = (date?: string) => {
        if (!date || date.trim() === '') return null;
        return dayjs(date).toDate();
    }

    const DateStart = normalizeDate(startDate);
    const DateEnd = normalizeDate(endDate);
    const DateExactly = normalizeDate(exactlyDate);

    const totalCobranzaQuery = cobranzaQuery.getCobranzaTotal;
    const countCobranzaQuery = cobranzaQuery.getCobranzaCount;

    // 🔹 Ejecutamos ambos queries en paralelo
    const [totalResult, countResult] = await Promise.all([
        pool.request()
            .input('nombre', termSearch)
            .input('DateStart', DateStart)
            .input('DateEnd', DateEnd)
            .input('DateExactly', DateExactly)
            .query(totalCobranzaQuery),

        pool.request()
            .input('nombre', termSearch)
            .input('DateStart', DateStart)
            .input('DateEnd', DateEnd)
            .input('DateExactly', DateExactly)
            .query(countCobranzaQuery),
    ]);

    return {
        count: Number(countResult.recordset[0]?.TotalCount ?? 0),
        total: totalResult.recordset[0],
    };
}

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
}: GetCobranzaByClientParams): Promise<{ cobranza: SellsInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = cobranzaQuery.getCobranzaByClient;

    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', TipoDoc !== 0 ? 1 : 0)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(query);

    return {
        cobranza: request.recordset
    }
};

const getCobranzaByClientCountAndTotalService = async ({
    userSession,
    FilterExpired,
    FilterNotExpired,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart,
    Id_Cliente,
    Id_Almacen
}: GetCobranzaByClientParams): Promise<{ count: number, total: GetCobranzaTotalResponse }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const countQuery = cobranzaQuery.getCobranzaByClientCount;
    const totalQuery = cobranzaQuery.getCobranzaByClientTotal;


    // Ejecutamos ambas consultas en paralelo
    const [countRequest, totalRequest] = await Promise.all([
        pool.request()
            .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
            .input('FilterExpired', FilterExpired)
            .input('FilterNotExpired', FilterNotExpired)
            .input('DateStart', DateStart)
            .input('DateEnd', DateEnd)
            .input('DateExactly', DateExactly)
            .input('TipoDoc', TipoDoc)
            .input('Id_Cliente', Id_Cliente)
            .input('Id_Almacen', Id_Almacen)
            .query(countQuery),

        pool.request()
            .input('FilterTipoDoc', TipoDoc === 0 ? 0 : 1)
            .input('FilterExpired', FilterExpired)
            .input('FilterNotExpired', FilterNotExpired)
            .input('DateStart', DateStart)
            .input('DateEnd', DateEnd)
            .input('DateExactly', DateExactly)
            .input('TipoDoc', TipoDoc)
            .input('Id_Cliente', Id_Cliente)
            .input('Id_Almacen', Id_Almacen)
            .query(totalQuery)
    ]);

    return {
        count: Number(countRequest.recordset[0]?.TotalCount ?? 0),
        total: totalRequest.recordset[0]
    };
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
}: GetCobranzaByClientParams): Promise<GetCobranzaTotalsResponse> => {

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
    const brief = recordsets[0][0] as GetCobranzaTotalsResponse;
    const { SaldoVencido, SaldoNoVencido, TotalSaldo } = brief;

    return {
        SaldoVencido, SaldoNoVencido, TotalSaldo
    }
};

export {
    getCobranzaService,
    getCobranzaCountAndTotalService,
    getCobranzaByClientService,
    getCobranzaByClientCountAndTotalService,
    getCobranzaWithTotalsService
}