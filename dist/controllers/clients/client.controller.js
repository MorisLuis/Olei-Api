"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClient = exports.getTotalClients = exports.searchClient = exports.selectClient = exports.getClientId = exports.getClients = void 0;
const clients_service_1 = require("../../services/clients/clients.service");
const client_schema_1 = require("./client.schema");
const generate_redis_1 = require("../../helpers/generate-redis");
const parsePrismaFilter_1 = require("../../utils/prisma/parsePrismaFilter");
const getClients = async (req, res, next) => {
    try {
        const { PageNumber, limit, orderField, orderDirection, filterField, filterValue } = client_schema_1.getClientsQuerySchema.parse(req.query);
        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;
        const filters = (0, parsePrismaFilter_1.parsePrismaFilter)(filterField, filterValue);
        const { clientes, total } = await (0, clients_service_1.getClientsService)({
            userSession,
            orderField,
            orderDirection,
            skip,
            limit,
            filters
        });
        return res.json({
            ok: true,
            clients: clientes,
            total
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getClients = getClients;
const getTotalClients = async (req, res, next) => {
    try {
        const { searchTerm } = client_schema_1.getClientsTotalQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const total = await (0, clients_service_1.getTotalClientsService)({ userSession, searchTerm });
        return res.json({ total });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getTotalClients = getTotalClients;
const getClientId = async (req, res, next) => {
    try {
        const { Id_Almacen, Id_Cliente } = client_schema_1.getClientIdQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const client = await (0, clients_service_1.getClientIdService)({
            userSession,
            Id_Cliente,
            Id_Almacen
        });
        return res.json({
            client
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getClientId = getClientId;
const selectClient = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const sessionId = req.sessionId;
        const { Id_Cliente, Id_Almacen, Id_ListPre } = client_schema_1.selectClientBodySchema.parse(req.body);
        const client = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        };
        const datosDelUsuario = {
            ...userSession,
            ...client
        };
        await (0, generate_redis_1.updateWebSession)(sessionId, datosDelUsuario);
        return res.json({
            ok: true
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.selectClient = selectClient;
const searchClient = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { term } = client_schema_1.searchClientQuerySchema.parse(req.query);
        const { clients } = await (0, clients_service_1.searchClientService)({ userSession, term });
        return res.json({
            clients
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.searchClient = searchClient;
const updateClient = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const body = req.body;
        const { id: Id_Cliente } = req.params;
        const { Id_Almacen } = req.query;
        const { client } = await (0, clients_service_1.updateClientService)({
            userSession,
            Id_Cliente: Number(Id_Cliente),
            Id_Almacen: Number(Id_Almacen),
            body
        });
        return res.json({
            client
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateClient = updateClient;
//# sourceMappingURL=client.controller.js.map