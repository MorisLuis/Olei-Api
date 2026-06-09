import { dbConnectionWeb } from "../../database";
import { sellsQuery } from "../../database/querys/sells";
import { ValidationError } from "../../errors/CustomError";
import type { SellsInterface } from "../../interface/sells";
import type { UserWebSessionInterface } from "../../interface/user";
import sql from 'mssql';
import { numeroALetra } from "../../utils/numeroALetra";
import { convertArrayToXml } from "../../utils/convertArrayToXml";
import type { GetSellsServiceParams, GetSellsTotalServiceResponse, GetSellsByClientPaginatedServiceParams, GetSellsPaignatedServiceParams, GetSellsByClientServiceParams, PostSellServiceParams, PostSellServiceResponse } from "./sellsDocsServices.interface";


const postSellService = async ({
    userSession,
    Total,
    Subtotal,
    sellsDetails,
    sellsData,
    Id_Cliente
}: PostSellServiceParams): Promise<PostSellServiceResponse> => {

    const { ServidorSQL, BaseSQL, Id_ListPre, Id_Almacen, TipoDocOO } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const request = new sql.Request(transaction);

        const totalImpuesto = Total - Subtotal;
        const cantLetra = numeroALetra(Total);

        const xmlDataSales = convertArrayToXml(sellsData);
        const xmlDataSalesDetails = convertArrayToXml(sellsDetails);

        if (!xmlDataSales || !xmlDataSalesDetails) {
            throw new ValidationError('No fue posible convertir la venta a XML');
        }

        if (!Id_Almacen) {
            throw new ValidationError("Id Almacen necesario")
        };

        console.log({ Id_Cliente })

        if (Id_Cliente === undefined || Id_Cliente === null) {
            throw new ValidationError("Id Cliente necesario")
        }

        

        const result = await request
            .input('xmlDataSales', sql.Xml, xmlDataSales)
            .input('xmlDataSalesDetails', sql.Xml, xmlDataSalesDetails)
            .input('Id_Usuario', sql.Int, 1)
            .input('Id_Almacen', sql.Int, Id_Almacen)
            .input('Id_Cliente', sql.Int, Id_Cliente)
            .input('Id_ListPre', sql.Int, Id_ListPre)
            .input('TipoDoc', sql.Int, 1)
            .input('CantLetra', sql.VarChar, cantLetra)
            .input('TotalImpuesto', sql.Decimal, totalImpuesto)
            .output('Folio', sql.Int)
            .execute('fn_ExecuteSales');

        await transaction.commit();

        return {
            folio: String(result.recordset[0]?.Folio ?? result.output.Folio ?? ''),
            TipoDoc: TipoDocOO
        };
    } catch (error) {
                console.log(error)

        await transaction.rollback();
        throw error;
    }
};

const getSellsCountAndTotalService = async ({
    userSession,
    searchTerm,


    DateEnd,
    DateExactly,
    DateStart
}: GetSellsServiceParams): Promise<GetSellsTotalServiceResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const totalSellsQuery = sellsQuery.getSellsTotal;
    const countSellsQuery = sellsQuery.getSellsCount;


    const requestTotal = await pool.request()
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

const getSellsByClientService = async ({
    userSession,
    PageNumber,
    Id_Cliente,
    SellsOrderCondition,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetSellsByClientPaginatedServiceParams): Promise<{ sells: SellsInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsQuery.getSellsByClient;
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

const getSellsByClientCountAndTotalService = async ({
    userSession,
    Id_Cliente,
    TipoDoc,
    DateEnd,
    DateExactly,
    DateStart
}: GetSellsByClientServiceParams): Promise<GetSellsTotalServiceResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const totalSellsQuery = sellsQuery.getSellsByClientTotal;
    const countSellsQuery = sellsQuery.getSellsByClientCount;

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

const getSellByIdService = async (
    userSession: UserWebSessionInterface,
    folio: string,
    Serie: string,
    Id_Almacen: number,
    TipoDoc: SellsInterface['TipoDoc']
): Promise<SellsInterface> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = sellsQuery.getSellById;
    const request = await pool.request()
        .input('Id_Almacen', Id_Almacen)
        .input('Serie', Serie)
        .input('Folio', folio)
        .input('TipoDoc', TipoDoc)
        .query(query);

    const sell = request.recordset[0];

    return sell
};


// TODO: This service has to be deprecated
const getSellsService = async ({
    userSession,
    PageNumber,
    sellsOrderCondition,
    searchTerm,

    DateEnd,
    DateExactly,
    DateStart
}: GetSellsPaignatedServiceParams): Promise<{ sells: SellsInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    console.log({ userSession })
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = sellsQuery.getSells;

    const requestSells = await pool.request()
        .input('OrderCondition', sellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('searchTerm', searchTerm)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .query(query);

    const sells = requestSells.recordset
    return {
        sells
    };
};


export {
    postSellService,
    getSellsService,
    getSellsCountAndTotalService,
    getSellsByClientService,
    getSellsByClientCountAndTotalService,
    getSellByIdService
}