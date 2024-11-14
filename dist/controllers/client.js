"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectClient = exports.getClientId = exports.getClients = void 0;
const generate_jwt_1 = require("../helpers/generate-jwt");
const getSession_1 = require("../utils/Redis/getSession");
const deleteRedis_1 = require("../utils/Redis/deleteRedis");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const clientsServices_1 = require("../services/clientsServices");
const client_1 = require("../interface/client");
const getClients = async (req, res, next) => {
    try {
        const { PageNumber, clientOrderCondition } = req.query;
        const sessionId = req.sessionID;
        let orderCondition;
        if (typeof clientOrderCondition === 'string' && client_1.ClientOrderCondition.includes(clientOrderCondition)) {
            orderCondition = clientOrderCondition;
        }
        else {
            orderCondition = "";
        }
        const meeting = await (0, clientsServices_1.getClientsService)({
            PageNumber: Number(PageNumber),
            sessionId,
            OrderCondition: orderCondition
        });
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getClients = getClients;
const getClientId = async (req, res, next) => {
    try {
        const { PageNumber, clientOrderCondition, Id_Almacen, Id_Cliente } = req.query;
        const sessionId = req.sessionID;
        let orderCondition;
        if (typeof clientOrderCondition === 'string' && client_1.ClientOrderCondition.includes(clientOrderCondition)) {
            orderCondition = clientOrderCondition;
        }
        else {
            orderCondition = "";
        }
        const meeting = await (0, clientsServices_1.getClientIdService)({
            sessionId,
            Id_Cliente: Number(Id_Cliente),
            Id_Almacen: Number(Id_Almacen)
        });
        res.json(meeting);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getClientId = getClientId;
const selectClient = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { Id } = userFR;
        const { Id_Cliente, Id_Almacen, Id_ListPre } = req.body;
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
        next(error);
    }
};
exports.selectClient = selectClient;
//# sourceMappingURL=client.js.map