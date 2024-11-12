"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalOrders = exports.getOrderDetails = exports.getAllOrders = exports.getOrder = exports.postOrder = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const orders_1 = require("../database/querys/orders");
const getSession_1 = require("../utils/Redis/getSession");
const convertArrayToXml_1 = require("../utils/convertArrayToXml");
const numeroALetra_1 = require("../utils/numeroALetra");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const postOrder = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Serverweb, Baseweb, Id_ListPre, Id_Cliente, Id_Almacen, TipoDocOO } = userFR;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        ;
        const { sellsDetails, sellsData } = req.body;
        const { Subtotal, Total } = sellsData ?? {};
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
        res.status(201).json({
            ok: true,
            folio
        });
    }
    catch (error) {
        next(error);
    }
};
exports.postOrder = postOrder;
const getOrder = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
        const { folio } = req.params;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        const getOrderQuery = orders_1.orderQuerys.getOrder;
        const request = await pool.request()
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .input('folio', mssql_1.default.Int, folio)
            .input('TipoDocOO', TipoDocOO)
            .query(getOrderQuery);
        let order = request.recordset[0];
        res.json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrder = getOrder;
const getAllOrders = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
        const { page, limit } = req.query;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        const query = orders_1.orderQuerys.getAllOrders;
        const request = await pool.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .input('PageNumber', mssql_1.default.Int, page)
            .input('PageSize', mssql_1.default.Int, limit)
            .query(query);
        let allOrders = request.recordset;
        res.json(allOrders);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
const getOrderDetails = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        ;
        const { Serverweb, Baseweb } = userFR;
        const { folio } = req.query;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        ;
        const query = orders_1.orderQuerys.getOrderDetails;
        const request = await pool.request()
            .input('folio', mssql_1.default.Int, folio)
            .query(query);
        let orderDetails = request.recordset;
        res.json(orderDetails);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderDetails = getOrderDetails;
const getTotalOrders = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Serverweb, Baseweb, TipoDocOO, Id_Cliente } = userFR;
        const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
        }
        const result = await pool?.request()
            .input('TipoDocOO', TipoDocOO)
            .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
            .query(orders_1.orderQuerys.getTotalOrders);
        res.json({ total: result?.recordset[0][""] });
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalOrders = getTotalOrders;
//# sourceMappingURL=order.js.map