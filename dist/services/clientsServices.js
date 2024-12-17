"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalClientsService = exports.getClientIdService = exports.getClientsService = void 0;
const database_1 = require("../database");
const clients_1 = require("../database/querys/clients");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const getClientsService = async ({ PageNumber, sessionId, OrderCondition }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = clients_1.clientsQuerys.getClients;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('OrderCondition', OrderCondition)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getClientsService = getClientsService;
const getClientIdService = async ({ sessionId, Id_Cliente, Id_Almacen }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    if (!Id_Cliente) {
        throw new BadRequestError_1.default({ code: 500, message: 'Es necesario el id de el cliente', logging: true });
    }
    if (!Id_Almacen) {
        throw new BadRequestError_1.default({ code: 500, message: 'Es necesario el id de el almacen', logging: true });
    }
    let query = clients_1.clientsQuerys.getClientId;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(query);
    const quotes = request.recordset[0];
    return quotes;
};
exports.getClientIdService = getClientIdService;
const getTotalClientsService = async (sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = clients_1.clientsQuerys.getTotalClients;
    const request = await pool.request()
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalClientsService = getTotalClientsService;
//# sourceMappingURL=clientsServices.js.map