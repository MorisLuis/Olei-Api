"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalSellsByClientService = exports.getTotalSellsService = exports.getSellByIdService = exports.getSellsByClientService = exports.getSellsService = void 0;
const database_1 = require("../database");
const sells_1 = require("../database/querys/sells");
const CustomError_1 = require("../errors/CustomError");
const getSellsService = async (userSession, PageNumber, SellsOrderCondition) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = sells_1.sellsQuery.getSells;
    const request = await pool.request()
        .input('OrderCondition', SellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);
    const sells = request.recordset;
    return sells;
};
exports.getSellsService = getSellsService;
;
const getSellsByClientService = async ({ userSession, PageNumber, Id_Cliente, SellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = sells_1.sellsQuery.getSellsByClient;
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
    const sells = request.recordset;
    return sells;
};
exports.getSellsByClientService = getSellsByClientService;
const getSellByIdService = async (userSession, folio, Serie, Id_Almacen, TipoDoc) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = sells_1.sellsQuery.getSellById;
    const request = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .input('Serie', Serie)
        .input('Folio', folio)
        .input('TipoDoc', TipoDoc)
        .query(query);
    const sell = request.recordset[0];
    return sell;
};
exports.getSellByIdService = getSellByIdService;
const getTotalSellsService = async (userSession) => {
    ;
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = sells_1.sellsQuery.getTotalSells;
    const request = await pool.request()
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalSellsService = getTotalSellsService;
;
const getTotalSellsByClientService = async ({ userSession, Id_Cliente, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = sells_1.sellsQuery.getTotalSellsByClient;
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
exports.getTotalSellsByClientService = getTotalSellsByClientService;
//# sourceMappingURL=sellsDocsServices.js.map