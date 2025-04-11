"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalCobranzaService = exports.getCobranzaWithTotalsService = exports.getAllCobranzaService = exports.getCobranzaService = void 0;
const database_1 = require("../database");
const cobranza_1 = require("../database/querys/cobranza");
const CustomError_1 = require("../errors/CustomError");
;
const getCobranzaService = async ({ userSession, PageNumber, Id_Cliente, SellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, PageSize = 10 }) => {
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
    const sells = request.recordset;
    return sells;
};
exports.getCobranzaService = getCobranzaService;
const getTotalCobranzaService = async ({ userSession, Id_Cliente, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getTotalCobranza;
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
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalCobranzaService = getTotalCobranzaService;
const getCobranzaWithTotalsService = async ({ userSession, Id_Cliente, FilterTipoDoc, FilterExpired, FilterNotExpired, SellsOrderCondition, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = cobranza_1.cobranzaQuery.getCobranzaWithTotals;
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
    console.log({ request });
    const recordsets = Array.isArray(request.recordsets) ? request.recordsets : Object.values(request.recordsets);
    const brief = recordsets[0][0];
    return {
        brief
    };
};
exports.getCobranzaWithTotalsService = getCobranzaWithTotalsService;
/* UTILS */
const getAllCobranzaService = async (params) => {
    let allSells = [];
    let pageNumber = params.PageNumber || 1;
    const pageSize = params.PageSize || 100;
    let hasMore = true;
    const sells = await getCobranzaService({ ...params, PageNumber: pageNumber, PageSize: pageSize });
    const { brief } = await getCobranzaWithTotalsService({ ...params, PageNumber: pageNumber, PageSize: pageSize });
    console.log({ brief });
    while (hasMore) {
        if (sells.length > 0) {
            allSells = allSells.concat(sells);
            pageNumber++;
        }
        else {
            hasMore = false;
        }
        ;
    }
    return allSells;
};
exports.getAllCobranzaService = getAllCobranzaService;
//# sourceMappingURL=cobranzaService.js.map