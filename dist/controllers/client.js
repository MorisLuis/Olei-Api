"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalClients = exports.searchClient = exports.selectClient = exports.getClientId = exports.getClients = void 0;
const generate_jwt_1 = require("../helpers/generate-jwt");
const getSession_1 = require("../utils/Redis/getSession");
const deleteRedis_1 = require("../utils/Redis/deleteRedis");
const clientsServices_1 = require("../services/clientsServices");
const clientValidations_1 = require("../validations/clientValidations");
const zod_1 = require("zod");
const CustomError_1 = require("../errors/CustomError");
const getClients = async (req, res, next) => {
    try {
        const { PageNumber, clientOrderCondition } = clientValidations_1.getClientsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const clients = await (0, clientsServices_1.getClientsService)({
            sessionId,
            PageNumber: PageNumber,
            OrderCondition: clientOrderCondition
        });
        res.json(clients);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
    ;
};
exports.getClients = getClients;
const getTotalClients = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const total = await (0, clientsServices_1.getTotalClientsService)(sessionId);
        res.json(total);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
    ;
};
exports.getTotalClients = getTotalClients;
const getClientId = async (req, res, next) => {
    try {
        const { Id_Almacen, Id_Cliente } = clientValidations_1.getClientIdQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const clients = await (0, clientsServices_1.getClientIdService)({
            sessionId,
            Id_Cliente,
            Id_Almacen
        });
        res.status(200).json({
            success: true,
            data: clients ?? null
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ message: "Validation error", errors: error.errors });
            }
            else {
                next(error);
            }
            ;
        }
    }
};
exports.getClientId = getClientId;
const selectClient = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        ;
        const { Id } = userFR;
        const { Id_Cliente, Id_Almacen, Id_ListPre } = clientValidations_1.selectClientBodySchema.parse(req.body);
        const client = {
            Id_Almacen: Id_Almacen,
            Id_Cliente: Id_Cliente,
            Id_ListPre: Id_ListPre,
            IsEmploye: true
        };
        const datosDelUsuario = {
            ...userFR,
            ...client
        };
        req.session.userWeb = datosDelUsuario;
        const token = await (0, generate_jwt_1.generateWebJWT)({ Id: Id, sessionRedis: req.sessionID });
        (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        return res.json({
            ok: true,
            token
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.selectClient = selectClient;
const searchClient = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const { term } = clientValidations_1.searchClientQuerySchema.parse(req.query);
        const { Clients } = await (0, clientsServices_1.searchClientService)({ sessionId, term });
        res.json({
            Clients
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchClient = searchClient;
//# sourceMappingURL=client.js.map