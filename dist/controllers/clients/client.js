"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClient = exports.getTotalClients = exports.searchClient = exports.selectClient = exports.getClientId = exports.getClients = void 0;
const clientsServices_1 = require("../../services/clients/clientsServices");
const clientValidations_1 = require("../../validations/clientValidations");
const generate_redis_1 = require("../../helpers/generate-redis");
const getClients = async (req, res, next) => {
    try {
        const { PageNumber, clientOrderCondition, searchTerm, searchId, limit } = clientValidations_1.getClientsQuerySchema.parse(req.query);
        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;
        const { clients, total } = await (0, clientsServices_1.getClientsService)({
            skip,
            limit,
            userSession,
            clientOrderCondition,
            searchTerm,
            searchId
        });
        return res.json({
            ok: true,
            clients,
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
        const { searchTerm } = clientValidations_1.getClientsTotalQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const total = await (0, clientsServices_1.getTotalClientsService)({ userSession, searchTerm });
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
        const { Id_Almacen, Id_Cliente } = clientValidations_1.getClientIdQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const client = await (0, clientsServices_1.getClientIdService)({
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
        const { Id_Cliente, Id_Almacen, Id_ListPre } = clientValidations_1.selectClientBodySchema.parse(req.body);
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
        const { term } = clientValidations_1.searchClientQuerySchema.parse(req.query);
        const { clients } = await (0, clientsServices_1.searchClientService)({ userSession, term });
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
        const { Id_Almacen, IdOLEI } = req.query;
        const { client } = await (0, clientsServices_1.updateClientService)({
            userSession,
            Id_Cliente: Number(Id_Cliente),
            Id_Almacen: Number(Id_Almacen),
            IdOLEI: Number(IdOLEI),
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
//# sourceMappingURL=client.js.map