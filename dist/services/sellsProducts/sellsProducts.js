"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellsProductsCountAndTotalService = exports.getSellsProductsService = void 0;
const database_1 = require("../../database");
const sellsProducts_1 = require("../../database/querys/sellsProducts");
const CustomError_1 = require("../../errors/CustomError");
const getSellsProductsService = async ({ Marca, DateEnd, DateExactly, DateStart, Descripcion, userSession, Sku, Codigo, OrderCondition, PageNumber }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = sellsProducts_1.sellsProductsQuery.getSellsProducts;
    const requestSells = await pool.request()
        .input('OrderCondition', OrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Marca', Marca)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('DateStart', DateStart)
        .input('Descripcion', Descripcion)
        .input('Sku', Sku)
        .input('Codigo', Codigo)
        .query(query);
    const sells = requestSells.recordset;
    return {
        sells
    };
};
exports.getSellsProductsService = getSellsProductsService;
const getSellsProductsCountAndTotalService = async ({ Codigo, Sku, Marca, DateEnd, DateExactly, DateStart, Descripcion, userSession, }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const totalSellsProductsQuery = sellsProducts_1.sellsProductsQuery.getSellsProductsTotals;
    const countSellsProductsQuery = sellsProducts_1.sellsProductsQuery.getSellsProductsCount;
    const requestTotal = await pool.request()
        .input('Marca', Marca)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('DateStart', DateStart)
        .input('Descripcion', Descripcion)
        .input('Sku', Sku)
        .input('Codigo', Codigo)
        .query(totalSellsProductsQuery);
    const requestCount = await pool.request()
        .input('Marca', Marca)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('DateStart', DateStart)
        .input('Descripcion', Descripcion)
        .input('Sku', Sku)
        .input('Codigo', Codigo)
        .query(countSellsProductsQuery);
    const [countResult, totalResult] = await Promise.all([
        requestCount,
        requestTotal
    ]);
    return {
        count: Number(countResult.recordset[0]?.TotalCount ?? 0),
        totals: totalResult.recordset[0]
    };
};
exports.getSellsProductsCountAndTotalService = getSellsProductsCountAndTotalService;
//# sourceMappingURL=sellsProducts.js.map