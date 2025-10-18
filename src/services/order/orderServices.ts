import { dbConnectionWeb } from "../../database";
import { orderQuerys } from "../../database/querys/orders";
import sql from 'mssql';
import { numeroALetra } from "../../utils/numeroALetra";
import { convertArrayToXml } from "../../utils/convertArrayToXml";
import type { SellsDetailsInterface } from "../../interface/sells";
import { ValidationError } from "../../errors/CustomError";
import type { UserWebSessionInterface } from "../../interface/user";
import type { GetAllOrdersServiceParams, GetAllOrdersServiceResponse, GetOrderDetailsSellsParams, GetOrderDetailsSellsResponse, GetOrderServiceParams, GetOrderServiceResponse, GetTotalOrderDetailsSellsParams, GetTotalOrderDetailsSellsResponse, PostOrderServiceParams, PostOrderServiceResponse } from "./orderService.interface";


const getOrderService = async ({
    userSession,
    folio
}: GetOrderServiceParams): Promise<GetOrderServiceResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const getOrderQuery = orderQuerys.getOrder;

    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .query(getOrderQuery);

    const order = request.recordset[0];

    return {
        order
    }
};

const getAllOrdersService = async ({
    userSession,
    page,
    limit
}: GetAllOrdersServiceParams): Promise<GetAllOrdersServiceResponse> => {

    const { ServidorSQL, BaseSQL, TipoDocOO, Id_Cliente } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const query = orderQuerys.getAllOrders;

    const request = await pool.request()
        .input('TipoDocOO', TipoDocOO)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('PageNumber', sql.Int, page)
        .input('PageSize', sql.Int, limit)
        .query(query);

    let allOrders = request.recordset;

    return {
        allOrders
    }
};

const getOrderDetailsSells = async ({
    PageNumber,
    folio,
    TipoDoc,
    userSession
}: GetOrderDetailsSellsParams): Promise<GetOrderDetailsSellsResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    // Whe made a little variotion when the PageNumber is 999.
    // This variation is used in the function 'handleGetOrderDetails' in olei web
    const pageNumberModified = PageNumber === 999 ? 1 : PageNumber;
    const pageSizeModified = PageNumber === 999 ? 100 : 10

    const query = orderQuerys.getOrderDetails;
    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .input('TipoDoc', sql.Int, TipoDoc)
        .input('PageNumber', sql.Int, pageNumberModified)
        .input('PageSize', sql.Int, pageSizeModified)
        .query(query);

    const orderDetails = request.recordset
    const response: { orderDetails: SellsDetailsInterface[] } = { orderDetails };

    return response;
};

const getTotalAllOrdersService = async (userSession: UserWebSessionInterface): Promise<{ total: number }> => {

    const { ServidorSQL, BaseSQL, TipoDocOO, Id_Cliente } = userSession;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const result = await pool?.request()
        .input('TipoDocOO', TipoDocOO)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .query(orderQuerys.getTotalAllOrders);

    const total = result?.recordset[0].TotalCount;

    return {
        total
    }

};

const getTotalOrderDetailsService = async ({
    folio,
    TipoDoc,
    userSession
}: GetTotalOrderDetailsSellsParams): Promise<GetTotalOrderDetailsSellsResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const query = orderQuerys.getTotalOrderDetails;
    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .input('TipoDoc', sql.Int, TipoDoc)
        .query(query);

    const total = request.recordset[0].TotalCount

    return { total };
};

const postOrderService = async ({
    userSession,
    Total,
    Subtotal,
    sellsDetails,
    sellsData
}: PostOrderServiceParams): Promise<PostOrderServiceResponse> => {


    const { ServidorSQL, BaseSQL, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    const TotalImpuesto = Total - Subtotal;
    const CantLetra = numeroALetra(Total);


    const xmlDataSales = await convertArrayToXml(sellsData);
    const xmlDataSalesDetails = await convertArrayToXml(sellsDetails);

    if (!Id_Almacen) {
        throw new ValidationError("Id Almacen necesario")
    };

    if (!Id_Cliente) {
        throw new ValidationError("Id Cliente necesario")
    }

    const result = await request
        .input('xmlDataSales', sql.Xml, xmlDataSales)
        .input('xmlDataSalesDetails', sql.Xml, xmlDataSalesDetails)
        .input('Id_Usuario', sql.Int, 1)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('Id_ListPre', sql.Int, Id_ListPre)
        .input('TipoDoc', sql.Int, TipoDocOO)
        .input('CantLetra', sql.VarChar, CantLetra)
        .input('TotalImpuesto', sql.Decimal, TotalImpuesto)
        .output('Folio', sql.Int)
        .execute('fn_ExecuteSales');

    await transaction.commit();
    const folio = result.recordset[0].Folio

    return {
        folio,
        TipoDoc: TipoDocOO
    }
};

export {
    postOrderService,
    getOrderService,
    getAllOrdersService,
    getTotalOrderDetailsService,
    getTotalAllOrdersService,
    getOrderDetailsSells
}