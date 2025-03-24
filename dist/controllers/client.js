"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalClients = exports.searchClient = exports.selectClient = exports.getClientId = exports.getClients = void 0;
const clientsServices_1 = require("../services/clientsServices");
const clientValidations_1 = require("../validations/clientValidations");
const zod_1 = require("zod");
const generate_redis_1 = require("../helpers/generate-redis");
const getClients = async (req, res, next) => {
    try {
        const { PageNumber, clientOrderCondition } = clientValidations_1.getClientsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const clients = await (0, clientsServices_1.getClientsService)({
            userSession,
            PageNumber: PageNumber,
            OrderCondition: clientOrderCondition
        });
        return res.json(clients);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            return next(error);
        }
    }
    ;
};
exports.getClients = getClients;
const getTotalClients = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const total = await (0, clientsServices_1.getTotalClientsService)(userSession);
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
        const clients = await (0, clientsServices_1.getClientIdService)({
            userSession,
            Id_Cliente,
            Id_Almacen
        });
        return res.json({
            data: clients
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
        (0, generate_redis_1.updateWebSession)(sessionId, datosDelUsuario);
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
        const { Clients } = await (0, clientsServices_1.searchClientService)({ userSession, term });
        return res.json({
            Clients
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.searchClient = searchClient;
//# sourceMappingURL=client.js.map