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
const orderFunction_1 = require("../../utils/prisma/orderFunction");
const whereFunction_1 = require("../../utils/prisma/whereFunction");
const updateFunction_1 = require("../../utils/prisma/updateFunction");
const getClientsService = async ({ skip, limit, userSession, clientOrderCondition, searchTerm, searchId }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const prisma = (0, prismaConnection_1.getPrismaClient)(ServidorSQL, BaseSQL);
    const where = (0, whereFunction_1.buildWhereCondition)({
        Nombre: searchTerm,
        Id_Cliente: searchId
    }, ["Nombre"]);
    const orderBy = (0, orderFunction_1.buildOrder)({ field: clientOrderCondition, direction: "asc" }, 'Id_Cliente');
    const [clientes, totalClientes] = await Promise.all([
        prisma.clientes.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: {
                Nombre: true,
                Id_Almacen: true,
                Id_Cliente: true,
                IdOLEI: true
            }
        }),
        prisma.clientes.count({ where }),
    ]);
    return {
        clients: clientes,
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
const updateClientService = async ({ userSession, Id_Cliente, Id_Almacen, IdOLEI, body }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const prisma = (0, prismaConnection_1.getPrismaClient)(ServidorSQL, BaseSQL);
    const data = (0, updateFunction_1.buildUpdate)(body);
    const updatedClient = await prisma.clientes.update({
        where: {
            IdOLEI_Id_Almacen_Id_Cliente: {
                IdOLEI,
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
//# sourceMappingURL=clientsServices.js.map