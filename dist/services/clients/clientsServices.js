"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClientService = exports.getTotalClientsService = exports.getClientIdService = exports.getClientsService = void 0;
const database_1 = require("../../database");
const clients_1 = require("../../database/querys/clients");
const CustomError_1 = require("../../errors/CustomError");
const mssql_1 = __importDefault(require("mssql"));
const getClientsService = async ({ PageNumber, userSession, OrderCondition, searchTerm, searchId }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const clientsQuery = clients_1.clientsQuerys.getClients;
    const totalClientsQuery = clients_1.clientsQuerys.getTotalClients;
    const requestClients = pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('OrderCondition', OrderCondition)
        .input('searchTerm', searchTerm)
        .input('searchId', searchId)
        .query(clientsQuery);
    const requestTotal = pool.request()
        .input('searchTerm', searchTerm)
        .input('searchId', searchId)
        .query(totalClientsQuery);
    const [clientsResult, totalResult] = await Promise.all([
        requestClients,
        requestTotal
    ]);
    return {
        clients: clientsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    };
};
exports.getClientsService = getClientsService;
const getClientIdService = async ({ userSession, Id_Cliente, Id_Almacen, }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = clients_1.clientsQuerys.getClientId;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(query);
    const client = request.recordset[0];
    return client;
};
exports.getClientIdService = getClientIdService;
const getTotalClientsService = async ({ userSession, searchTerm }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = clients_1.clientsQuerys.getTotalClients;
    const request = await pool.request()
        .input('searchTerm', searchTerm)
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalClientsService = getTotalClientsService;
const searchClientService = async ({ userSession, term }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = clients_1.clientsQuerys.getClientBySearch;
    const result = await pool.request()
        .input('nombre', mssql_1.default.VarChar, term)
        .query(query);
    const clients = result.recordset;
    return {
        clients
    };
};
exports.searchClientService = searchClientService;
//# sourceMappingURL=clientsServices.js.map