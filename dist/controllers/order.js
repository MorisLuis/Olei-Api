"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalOrderDetails = exports.getTotalOrders = exports.getOrderDetails = exports.getAllOrders = exports.getOrder = exports.postOrder = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const orders_1 = require("../database/querys/orders");
const getSession_1 = require("../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const orderValidations_1 = require("../validations/orderValidations");
const orderServices_1 = require("../services/orderServices");
const postOrder = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { sellsDetails, sellsData } = orderValidations_1.postOrderBodySchema.parse(req.body);
        const { Subtotal, Total } = sellsData ?? {};
        const { folio } = await (0, orderServices_1.postOrderService)({
            sellsData,
            sellsDetails,
            sessionId,
            Subtotal,
            Total
        });
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
        const { folio, PageNumber } = orderValidations_1.getOrderDetailsQuerrySchema.parse(req.query);
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const orderDetails = await (0, orderServices_1.getOrderDetailsSells)({
            folio,
            PageNumber,
            sessionId
        });
        res.json(orderDetails);
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderDetails = getOrderDetails;
const getTotalOrderDetails = async (req, res, next) => {
    try {
        const { folio } = orderValidations_1.getTotalOrderDetailsQuerrySchema.parse(req.query);
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const orderDetails = await (0, orderServices_1.getTotalOrderDetailsSells)({
            folio,
            sessionId
        });
        res.json(orderDetails);
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalOrderDetails = getTotalOrderDetails;
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