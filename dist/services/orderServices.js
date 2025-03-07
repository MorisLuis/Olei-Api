"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailsSells = exports.getTotalAllOrdersService = exports.getTotalOrderDetailsService = exports.getAllOrdersService = exports.getOrderService = exports.postOrderService = void 0;
const database_1 = require("../database");
const orders_1 = require("../database/querys/orders");
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const numeroALetra_1 = require("../utils/numeroALetra");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const CustomError_1 = require("../errors/CustomError");
;
const postOrderService = async ({ sessionId, Total, Subtotal, sellsDetails, sellsData }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    ;
    const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    const request = new mssql_1.default.Request(transaction);
    const TotalImpuesto = Total - Subtotal;
    const CantLetra = (0, numeroALetra_1.numeroALetra)(Total);
    const xmlDataSales = await (0, convertArrayToXml_1.convertArrayToXml)(sellsData);
    const xmlDataSalesDetails = await (0, convertArrayToXml_1.convertArrayToXml)(sellsDetails);
    const result = await request
        .input('xmlDataSales', mssql_1.default.Xml, xmlDataSales)
        .input('xmlDataSalesDetails', mssql_1.default.Xml, xmlDataSalesDetails)
        .input('Id_Usuario', mssql_1.default.Int, 1)
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('Id_ListPre', mssql_1.default.Int, Id_ListPre)
        .input('TipoDoc', mssql_1.default.Int, TipoDocOO)
        .input('CantLetra', mssql_1.default.VarChar, CantLetra)
        .input('TotalImpuesto', mssql_1.default.Decimal, TotalImpuesto)
        .output('Folio', mssql_1.default.Int)
        .execute('fn_ExecuteSales');
    await transaction.commit();
    const folio = result.recordset[0].Folio;
    return {
        folio
    };
};
exports.postOrderService = postOrderService;
const getOrderService = async ({ sessionId, folio }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    ;
    const { Serverweb, Baseweb, Id_Cliente, TipoDocOO } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const getOrderQuery = orders_1.orderQuerys.getOrder;
    const request = await pool.request()
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('folio', mssql_1.default.Int, folio)
        .input('TipoDocOO', TipoDocOO)
        .query(getOrderQuery);
    const order = request.recordset[0];
    return {
        order
    };
};
exports.getOrderService = getOrderService;
const getAllOrdersService = async ({ sessionId, page, limit }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const query = orders_1.orderQuerys.getAllOrders;
    const request = await pool.request()
        .input('TipoDocOO', TipoDocOO)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('PageNumber', mssql_1.default.Int, page)
        .input('PageSize', mssql_1.default.Int, limit)
        .query(query);
    let allOrders = request.recordset;
    return {
        allOrders
    };
};
exports.getAllOrdersService = getAllOrdersService;
const getOrderDetailsSells = async ({ PageNumber, folio, sessionId }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    // Whe made a little variotion when the PageNumber is 999.
    // This variation is used in the function 'handleGetOrderDetails' in olei web
    const pageNumberModified = PageNumber === 999 ? 1 : PageNumber;
    const pageSizeModified = PageNumber === 999 ? 100 : 10;
    const query = orders_1.orderQuerys.getOrderDetails;
    const request = await pool.request()
        .input('folio', mssql_1.default.Int, folio)
        .input('PageNumber', mssql_1.default.Int, pageNumberModified)
        .input('PageSize', mssql_1.default.Int, pageSizeModified)
        .query(query);
    const orderDetails = request.recordset;
    return orderDetails;
};
exports.getOrderDetailsSells = getOrderDetailsSells;
const getTotalAllOrdersService = async (sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const result = await pool?.request()
        .input('TipoDocOO', TipoDocOO)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .query(orders_1.orderQuerys.getTotalAllOrders);
    const total = result?.recordset[0].TotalCount;
    return {
        total
    };
};
exports.getTotalAllOrdersService = getTotalAllOrdersService;
;
const getTotalOrderDetailsService = async ({ folio, sessionId }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const query = orders_1.orderQuerys.getTotalOrderDetails;
    const request = await pool.request()
        .input('folio', mssql_1.default.Int, folio)
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalOrderDetailsService = getTotalOrderDetailsService;
//# sourceMappingURL=orderServices.js.map