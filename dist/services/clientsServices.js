"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClientService = exports.getTotalClientsService = exports.getClientIdService = exports.getClientsService = void 0;
const database_1 = require("../database");
const clients_1 = require("../database/querys/clients");
const CustomError_1 = require("../errors/CustomError");
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
;
const getClientsService = async ({ PageNumber, sessionId, OrderCondition }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
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
;
const getClientIdService = async ({ sessionId, Id_Cliente, Id_Almacen }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
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
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = clients_1.clientsQuerys.getTotalClients;
    const request = await pool.request()
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalClientsService = getTotalClientsService;
;
const searchClientService = async ({ sessionId, term }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = clients_1.clientsQuerys.getClientBySearch;
    const result = await pool.request()
        .input('nombre', mssql_1.default.VarChar, term)
        .query(query);
    const Clients = result.recordset;
    return {
        Clients
    };
};
exports.searchClientService = searchClientService;
//# sourceMappingURL=clientsServices.js.map