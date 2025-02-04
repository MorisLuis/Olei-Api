"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutDB = exports.logoutUser = exports.renewLogin = exports.renewDB = exports.login = exports.loginDB = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
const authAppServices_1 = require("../../services/authAppServices");
const loginDB = async (req, res, next) => {
    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;
        const { result } = await (0, authAppServices_1.loginDBAppService)({
            IdUsuarioOLEI,
            PasswordOLEI
        });
        const tokenDB = await (0, generate_jwt_1.generateJWTDB)({
            IdUsuarioOLEI: result.IdUsuarioOLEI.trim()
        });
        // Session redis
        const datosDelUsuario = {
            ServidorSQL: result.ServidorSQL.trim(),
            BaseSQL: result.BaseSQL.trim(),
            PasswordSQL: result.PasswordSQL.trim(),
            UsuarioSQL: result.UsuarioSQL.trim(),
            IdUsuarioOLEI: result.IdUsuarioOLEI.trim(),
            Id_Almacen: result.Id_Almacen,
            RazonSocial: result.RazonSocial.trim(),
            SwImagenes: result.SwImagenes,
            Vigencia: result.Vigencia,
            userId: undefined,
            userRol: undefined,
            from: 'mobil'
        };
        req.session.user = datosDelUsuario;
        // User to Frontend.
        const user = {
            BaseSQL: result.BaseSQL,
            RazonSocial: result.RazonSocial
        };
        return res.json({
            tokenDB,
            user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginDB = loginDB;
const login = async (req, res, next) => {
    try {
        const { Id_Usuario, password } = req.body;
        const sessionId = req.sessionID;
        const { userData } = await (0, authAppServices_1.loginAppService)({
            Id_Usuario,
            password,
            sessionId
        });
        const token = await (0, generate_jwt_1.generateJWT)({ id: Id_Usuario.trim() });
        const datosDelUsuario = {
            ...req.session.user,
            userId: Id_Usuario.trim(),
            userRol: userData.Id_Perfil,
            TodosAlmacenes: userData.TodosAlmacenes
        };
        // Session redis
        req.session.user = datosDelUsuario;
        const userStorage = {
            Id_Usuario,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            Id_TipoMovInv: {
                Id_TipoMovInv: userData.Id_TipoMovInv,
                Accion: userData.Accion,
                Descripcion: userData.Descripcion,
                Id_AlmDest: userData.Id_AlmDest
            }
        };
        return res.json({
            userStorage,
            token
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const renewDB = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { BaseSQL, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;
        const token = await (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI });
        if (!token) {
            throw new BadRequestError_1.default({ code: 401, message: "Failed to generate token", logging: true });
        }
        ;
        // User to Redis.
        const userRedis = {
            ...userFR,
            userId: userId ? userId : undefined,
            userRol: userRol ? userRol : undefined
        };
        // User to Frontend.
        const user = {
            BaseSQL: BaseSQL,
            RazonSocial: RazonSocial
        };
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "User data is neccesary", logging: true });
        }
        ;
        req.session.user = userRedis;
        res.json({
            token,
            user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.renewDB = renewDB;
const renewLogin = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { ServidorSQL, BaseSQL, userId, userRol, TodosAlmacenes } = userFR;
        if (!userId && !userRol) {
            throw new BadRequestError_1.default({ code: 401, message: "User not authenticated", logging: true });
        }
        ;
        if (!ServidorSQL && !BaseSQL) {
            throw new BadRequestError_1.default({ code: 401, message: "Server and base data is neccessary", logging: true });
        }
        ;
        const token = await (0, generate_jwt_1.generateJWT)({ id: userId });
        if (!token) {
            throw new BadRequestError_1.default({ code: 401, message: "Failed to generate token", logging: true });
        }
        ;
        const user = {
            Id_Usuario: userId,
            TodosAlmacenes
        };
        res.json({
            user,
            token
        });
    }
    catch (error) {
        next(error);
    }
};
exports.renewLogin = renewLogin;
const logoutUser = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        req.session.user = {
            ...req.session.user,
            userId: undefined,
            userRol: undefined
        };
        res.json({
            user: userFR
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutUser = logoutUser;
const logoutDB = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        if (!sessionId) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        await (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        await (0, database_1.closeDbConnection)();
        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutDB = logoutDB;
//# sourceMappingURL=auth.js.map