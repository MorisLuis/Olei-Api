"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalCobranzaService = exports.getCobranzaWithTotalsService = exports.getCobranzaService = exports.getCobranzaByClientService = void 0;
const database_1 = require("../../database");
const cobranza_1 = require("../../database/querys/cobranza");
const CustomError_1 = require("../../errors/CustomError");
const getCobranzaService = async ({ userSession, SellsOrderCondition, termSearch, PageSize = 10, PageNumber }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = cobranza_1.cobranzaQuery.getCobranza;
    const totalCobranzaQuery = cobranza_1.cobranzaQuery.getTotalCobranza;
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
    };
};
exports.getCobranzaService = getCobranzaService;
const getCobranzaByClientService = async ({ userSession, PageNumber, PageSize = 10, SellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, Id_Cliente }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getCobranzaByClient;
    const totalCobranzaByClientQuery = cobranza_1.cobranzaQuery.getTotalCobranzaByClient;
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
        .query(totalCobranzaByClientQuery);
    const [sellsResult, totalResult] = await Promise.all([
        request,
        requestTotal
    ]);
    return {
        cobranza: sellsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    };
};
exports.getCobranzaByClientService = getCobranzaByClientService;
const getTotalCobranzaService = async ({ userSession, Id_Cliente, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getTotalCobranza;
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
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalCobranzaService = getTotalCobranzaService;
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
    return {
        brief
    };
};
exports.getCobranzaWithTotalsService = getCobranzaWithTotalsService;
//# sourceMappingURL=cobranzaService.js.map