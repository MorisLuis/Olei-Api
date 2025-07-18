"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCobranzaWithTotalsService = exports.getCobranzaByClientCountAndTotalService = exports.getCobranzaByClientService = exports.getCobranzaCountAndTotalService = exports.getCobranzaService = void 0;
const database_1 = require("../../database");
const cobranza_1 = require("../../database/querys/cobranza");
const CustomError_1 = require("../../errors/CustomError");
const getCobranzaService = async ({ userSession, SellsOrderCondition, PageSize = 10, PageNumber, termSearch }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = cobranza_1.cobranzaQuery.getCobranza;
    const requestCobranza = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('nombre', termSearch)
        .input('OrderCondition', SellsOrderCondition)
        .query(query);
    return {
        cobranza: requestCobranza.recordset
    };
};
exports.getCobranzaService = getCobranzaService;
const getCobranzaCountAndTotalService = async ({ userSession, termSearch }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const totalCobranzaQuery = cobranza_1.cobranzaQuery.getCobranzaTotal;
    const countCobranzaQuery = cobranza_1.cobranzaQuery.getCobranzaCount;
    const requestTotal = await pool.request()
        .input('nombre', termSearch)
        .query(totalCobranzaQuery);
    const requestCount = pool.request()
        .input('nombre', termSearch)
        .query(countCobranzaQuery);
    const [countResult, totalResult] = await Promise.all([
        requestCount,
        requestTotal
    ]);
    return {
        count: Number(countResult.recordset[0]?.TotalCount ?? 0),
        total: totalResult.recordset[0]
    };
};
exports.getCobranzaCountAndTotalService = getCobranzaCountAndTotalService;
const getCobranzaByClientService = async ({ userSession, PageNumber, PageSize = 10, SellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, Id_Cliente, Id_Almacen }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = cobranza_1.cobranzaQuery.getCobranzaByClient;
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
    };
};
exports.getCobranzaByClientService = getCobranzaByClientService;
const getCobranzaByClientCountAndTotalService = async ({ userSession, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, Id_Cliente, Id_Almacen }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const countQuery = cobranza_1.cobranzaQuery.getCobranzaByClientCount;
    const totalQuery = cobranza_1.cobranzaQuery.getCobranzaByClientTotal;
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
exports.getCobranzaByClientCountAndTotalService = getCobranzaByClientCountAndTotalService;
const getCobranzaWithTotalsService = async ({ userSession, Id_Cliente, FilterExpired, FilterNotExpired, SellsOrderCondition, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getCobranzaWithTotals;
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
    const brief = recordsets[0][0];
    const { SaldoVencido, SaldoNoVencido, TotalSaldo } = brief;
    return {
        SaldoVencido, SaldoNoVencido, TotalSaldo
    };
};
exports.getCobranzaWithTotalsService = getCobranzaWithTotalsService;
//# sourceMappingURL=cobranzaService.js.map