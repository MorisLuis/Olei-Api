import { dbConnectionWeb } from "../../database";
import { sellsProductsQuery } from "../../database/querys/sellsProducts";
import { ValidationError } from "../../errors/CustomError";
import type { SellsProductsInterface } from "../../interface/sells";
import type { GetSellsProductsPaginatedServiceParams, GetSellsProductsPaginatedServiceResponse, GetSellsProductsServiceParams } from "./sellsProducts.interface";


const getSellsProductsService = async ({
    Marca,
    DateEnd,
    DateExactly,
    DateStart,
    Descripcion,
    userSession,
    Codigo,

    OrderCondition,
    PageNumber
}: GetSellsProductsPaginatedServiceParams): Promise<{ sells: SellsProductsInterface[] }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsProductsQuery.getSellsProducts;

    const requestSells = await pool.request()
        .input('OrderCondition', OrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Marca', Marca)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('DateStart', DateStart)
        .input('Descripcion', Descripcion)
        .input('Codigo', Codigo)
        .query(query);

    const sells = requestSells.recordset

    return {
        sells
    };

};


const getSellsProductsCountAndTotalService = async ({
    Codigo,
    Marca,
    DateEnd,
    DateExactly,
    DateStart,
    Descripcion,
    userSession,
}: GetSellsProductsServiceParams): Promise<GetSellsProductsPaginatedServiceResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const totalSellsProductsQuery = sellsProductsQuery.getSellsProductsTotals;
    const countSellsProductsQuery = sellsProductsQuery.getSellsProductsCount;

    const requestTotal = await pool.request()
        .input('Marca', Marca)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('DateStart', DateStart)
        .input('Descripcion', Descripcion)
        .input('Codigo', Codigo)
        .query(totalSellsProductsQuery);

    const requestCount = await pool.request()
        .input('Marca', Marca)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('DateStart', DateStart)
        .input('Descripcion', Descripcion)
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

export {
    getSellsProductsService,
    getSellsProductsCountAndTotalService
}