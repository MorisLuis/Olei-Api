"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutDB = exports.logoutUser = exports.renewLogin = exports.renewDB = exports.login = exports.loginDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
const loginDB = async (req, res, next) => {
    try {
        // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;
        const mainPool = await (0, database_1.dbConnectionMain)();
        if (!mainPool) {
            throw new BadRequestError_1.default({ code: 400, message: "Error connecting to the main database!", logging: true });
        }
        if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
            throw new BadRequestError_1.default({ code: 401, message: "Necesario enviar usuario y contraseña!", logging: true });
        }
        const query_DB = database_1.querys.authDatabase;
        const result = await mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        const cleanResult = result?.recordset[0];
        if (!cleanResult) {
            throw new BadRequestError_1.default({ code: 401, message: `No se encontro el usuario: ${IdUsuarioOLEI}`, logging: true });
        }
        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            throw new BadRequestError_1.default({ code: 401, message: `Contraseña incorrecta`, logging: true });
        }
        const user = {
            BaseSQL: cleanResult.BaseSQL,
            RazonSocial: cleanResult.RazonSocial
        };
        const tokenDB = await (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim() });
        const datosDelUsuario = {
            serverclientes: cleanResult.ServidorSQL.trim(),
            baseclientes: cleanResult.BaseSQL.trim(),
            PasswordSQL: cleanResult.PasswordSQL.trim(),
            UsuarioSQL: cleanResult.UsuarioSQL.trim(),
            IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim(),
            RazonSocial: cleanResult.RazonSocial.trim(),
            SwImagenes: cleanResult.SwImagenes,
            Vigencia: cleanResult.Vigencia,
            userId: undefined,
            userRol: undefined,
            from: 'mobil'
        };
        req.session.user = datosDelUsuario;
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
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
        }
        const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
        // STEP 1 - LOGIN
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: "Error connecting to the main database", logging: true });
        }
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;
        if (Id_Usuario.trim() === "" || password.trim() === "") {
            throw new BadRequestError_1.default({ code: 404, message: "Necesario escribir correo y contraseña", logging: true });
        }
        const request = pool.request();
        request.input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario);
        request.input('Password', mssql_1.default.VarChar(50), password);
        const resultData = await request.execute('sp_AuthenticateAndGetMovement');
        const Validations = resultData.recordsets[0];
        if (Validations[0].Tipo === "usuario" && Validations[0].Resultado !== 1) {
            throw new BadRequestError_1.default({ code: 404, message: "Correo no encontrada", logging: true });
        }
        if (Validations[1].Tipo === "contrasena" && Validations[1].Resultado !== 1) {
            throw new BadRequestError_1.default({ code: 404, message: "Contraseña incorrecta", logging: true });
        }
        const User = resultData.recordsets[1][0];
        const token = await (0, generate_jwt_1.generateJWT)({ id: Id_Usuario.trim() });
        req.session.user = {
            ...req.session.user,
            userId: Id_Usuario.trim(),
            userRol: User.Id_Perfil
        };
        const userStorage = {
            Id_Usuario,
            Id_TipoMovInv: {
                Id_TipoMovInv: User.Id_TipoMovInv,
                Accion: User.Accion,
                Descripcion: User.Descripcion,
                Id_AlmDest: User.Id_AlmDest
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
        const { baseclientes, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;
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
            BaseSQL: baseclientes,
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
        const { serverclientes, baseclientes, userId, userRol } = userFR;
        if (!userId && !userRol) {
            throw new BadRequestError_1.default({ code: 401, message: "User not authenticated", logging: true });
        }
        ;
        if (!serverclientes && !baseclientes) {
            throw new BadRequestError_1.default({ code: 401, message: "Server and base data is neccessary", logging: true });
        }
        ;
        const token = await (0, generate_jwt_1.generateJWT)({ id: userId });
        if (!token) {
            throw new BadRequestError_1.default({ code: 401, message: "Failed to generate token", logging: true });
        }
        ;
        const user = {
            Id_Usuario: userId
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