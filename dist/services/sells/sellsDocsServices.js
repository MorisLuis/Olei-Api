"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellByIdService = exports.getSellsByClientCountAndTotalService = exports.getSellsByClientService = exports.getSellsCountAndTotalService = exports.getSellsService = void 0;
const database_1 = require("../../database");
const sells_1 = require("../../database/querys/sells");
const CustomError_1 = require("../../errors/CustomError");
const getSellsService = async ({ userSession, PageNumber, sellsOrderCondition, searchTerm, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = sells_1.sellsQuery.getSells;
    const requestSells = await pool.request()
        .input('OrderCondition', sellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('searchTerm', searchTerm)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .query(query);
    const sells = requestSells.recordset;
    return {
        sells
    };
};
exports.getSellsService = getSellsService;
const getSellsCountAndTotalService = async ({ userSession, searchTerm, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const totalSellsQuery = sells_1.sellsQuery.getSellsTotal;
    const countSellsQuery = sells_1.sellsQuery.getSellsCount;
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
exports.getSellsCountAndTotalService = getSellsCountAndTotalService;
const getSellsByClientService = async ({ userSession, PageNumber, Id_Cliente, SellsOrderCondition, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = sells_1.sellsQuery.getSellsByClient;
    const requestSells = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', TipoDoc == 0 ? 0 : 1)
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
exports.getSellsByClientService = getSellsByClientService;
const getSellsByClientCountAndTotalService = async ({ userSession, Id_Cliente, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const totalSellsQuery = sells_1.sellsQuery.getSellsByClientTotal;
    const countSellsQuery = sells_1.sellsQuery.getSellsByClientCount;
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
exports.getSellsByClientCountAndTotalService = getSellsByClientCountAndTotalService;
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
//# sourceMappingURL=sellsDocsServices.js.map