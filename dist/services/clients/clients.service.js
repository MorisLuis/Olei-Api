"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientService = exports.searchClientService = exports.getTotalClientsService = exports.getClientIdService = exports.getClientsService = void 0;
const mssql_1 = __importDefault(require("mssql"));
const database_1 = require("../../database");
const clients_1 = require("../../database/querys/clients");
const CustomError_1 = require("../../errors/CustomError");
const prismaConnection_1 = require("../../database/prismaConnection");
const updateFunction_1 = require("../../utils/prisma/updateFunction");
const getClientsService = async (params) => {
    const { userSession: { ServidorSQL, BaseSQL }, orderField, PageNumber, limit, Nombre, Id_Cliente, } = params;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = clients_1.clientsQuerys.getClients;
    let queryTotal = clients_1.clientsQuerys.getTotalClients;
    const totalRequest = await pool.request()
        .input('Nombre', mssql_1.default.VarChar, Nombre === '' ? null : Nombre)
        .input('Id_Cliente', mssql_1.default.VarChar, Id_Cliente === '' ? null : Id_Cliente)
        .query(queryTotal);
    const request = await pool.request()
        .input('PageNumber', mssql_1.default.Int, PageNumber)
        .input('PageSize', mssql_1.default.Int, limit)
        .input('Nombre', mssql_1.default.VarChar, Nombre === '' ? null : Nombre)
        .input('Id_Cliente', mssql_1.default.VarChar, Id_Cliente === '' ? null : Id_Cliente)
        .input('OrderCondition', mssql_1.default.VarChar, orderField)
        .query(query);
    const clientes = request.recordset;
    const totalClientes = totalRequest.recordset[0].TotalCount;
    return {
        clientes,
        total: totalClientes
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
const updateClientService = async ({ userSession, Id_Cliente, Id_Almacen, body }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const prisma = (0, prismaConnection_1.getPrismaClient)(ServidorSQL, BaseSQL);
    const data = (0, updateFunction_1.buildUpdate)(body);
    const updatedClient = await prisma.clientes.update({
        where: {
            Id_Almacen_Id_Cliente: {
                Id_Almacen,
                Id_Cliente
            }
        },
        data
    });
    return {
        client: updatedClient
    };
};
exports.updateClientService = updateClientService;
//# sourceMappingURL=clients.service.js.map