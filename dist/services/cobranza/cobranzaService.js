"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalCobranzaService = exports.getCobranzaWithTotalsService = exports.getCobranzaService = exports.getCobranzaByClientService = void 0;
const database_1 = require("../../database");
const cobranza_1 = require("../../database/querys/cobranza");
const CustomError_1 = require("../../errors/CustomError");
const getCobranzaService = async ({ userSession, SellsOrderCondition, PageSize = 10, PageNumber }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getCobranza;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', PageSize)
        .input('OrderCondition', SellsOrderCondition)
        .query(query);
    const recordsets = Array.isArray(request.recordsets) ? request.recordsets : Object.values(request.recordsets);
    const cobranza = recordsets[0];
    return {
        cobranza
    };
};
exports.getCobranzaService = getCobranzaService;
const getCobranzaByClientService = async ({ userSession, PageNumber, PageSize = 10, SellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, Id_Cliente, Id_Almacen }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getCobranzaByClient;
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
    const cobranza = request.recordset;
    return { cobranza };
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