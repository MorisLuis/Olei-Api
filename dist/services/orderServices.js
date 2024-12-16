"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailsSells = exports.getTotalOrderDetailsSells = void 0;
const database_1 = require("../database");
const orders_1 = require("../database/querys/orders");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const getOrderDetailsSells = async ({ PageNumber, folio, sessionId }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }
    ;
    const query = orders_1.orderQuerys.getOrderDetails;
    const request = await pool.request()
        .input('folio', mssql_1.default.Int, folio)
        .input('PageNumber', mssql_1.default.Int, PageNumber)
        .input('PageSize', mssql_1.default.Int, 10)
        .query(query);
    const orderDetails = request.recordset;
    return orderDetails;
};
exports.getOrderDetailsSells = getOrderDetailsSells;
const getTotalOrderDetailsSells = async ({ folio, sessionId }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: "No se pudo establecer la conexión con la base de datos", logging: true });
    }
    ;
    const query = orders_1.orderQuerys.getTotalOrderDetails;
    const request = await pool.request()
        .input('folio', mssql_1.default.Int, folio)
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalOrderDetailsSells = getTotalOrderDetailsSells;
//# sourceMappingURL=orderServices.js.map