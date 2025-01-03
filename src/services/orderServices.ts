import { dbConnection } from "../database";
import { orderQuerys } from "../database/querys/orders";
import BadRequestError from "../errors/BadRequestError";
import { handleGetWebSession } from "../utils/Redis/getSession";
import sql from 'mssql';
import { numeroALetra } from "../utils/numeroALetra";
import { convertArrayToXml } from "../utils/convertArrayToXml";
import { SellsDetailsInterface, SellsInterface } from "../interface/sells";

interface postOrderServiceInterface {
    sessionId: string;
    Total: number;
    Subtotal: number;
    sellsDetails: Partial<SellsDetailsInterface>[];
    sellsData: Partial<SellsInterface>;
};

const postOrderService = async ({
    sessionId,
    Total,
    Subtotal,
    sellsDetails,
    sellsData
}: postOrderServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    const TotalImpuesto = Total - Subtotal;
    const CantLetra = numeroALetra(Total);

    const xmlDataSales = await convertArrayToXml(sellsData);
    const xmlDataSalesDetails = await convertArrayToXml(sellsDetails);

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
        folio
    }
};

interface getOrderServiceInterface {
    sessionId: string;
    folio: string;
}

const getOrderService = async ({
    sessionId,
    folio
}: getOrderServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    };


    const getOrderQuery = orderQuerys.getOrder;

    const request = await pool.request()
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('folio', sql.Int, folio)
        .input('TipoDocOO', TipoDocOO)
        .query(getOrderQuery);

    const order = request.recordset[0];

    return {
        order
    }
};

interface getAllOrdersServiceInterface {
    sessionId: string;
    page: number;
    limit: number;
}

const getAllOrdersService = async ({
    sessionId,
    page,
    limit
}: getAllOrdersServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;

    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
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

interface getOrderDetailsSellsInterface {
    PageNumber: number;
    folio: string;
    sessionId: string;
}

const getOrderDetailsSells = async ({
    PageNumber,
    folio,
    sessionId
}: getOrderDetailsSellsInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    };

    const query = orderQuerys.getOrderDetails;
    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .input('PageNumber', sql.Int, PageNumber)
        .input('PageSize', sql.Int, 10)
        .query(query);

    const orderDetails = request.recordset

    return orderDetails;
};

const getTotalAllOrdersService = async (sessionId: string) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;

    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
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

interface getTotalOrderDetailsSellsInterface {
    folio: string;
    sessionId: string;
};

const getTotalOrderDetailsService = async ({
    folio,
    sessionId
}: getTotalOrderDetailsSellsInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };
    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    };

    const query = orderQuerys.getTotalOrderDetails;
    const request = await pool.request()
        .input('folio', sql.Int, folio)
        .query(query);

    const total = request.recordset[0].TotalCount

    return total;
};

export {
    postOrderService,
    getOrderService,
    getAllOrdersService,
    getTotalOrderDetailsService,
    getTotalAllOrdersService,
    getOrderDetailsSells
}