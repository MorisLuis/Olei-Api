"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.renewWeb = exports.loginWeb = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const moment_1 = __importDefault(require("moment"));
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const BadRequestError_1 = __importDefault(require("../../errors/BadRequestError"));
const loginWeb = async (req, res, next) => {
    const { email, password } = req.body;
    if (email === "" || password === "") {
        throw new BadRequestError_1.default({ code: 401, message: "Necesario escribir correo y contraseña", logging: true });
    }
    try {
        const mainPool = await (0, database_1.dbConnectionMain)();
        if (!mainPool) {
            throw new BadRequestError_1.default({ code: 500, message: "Error connecting to the main database", logging: true });
        }
        const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);
        if (!user) {
            throw new BadRequestError_1.default({ code: 401, message: "Correo no encontrado", logging: true });
        }
        if (user.PasswordOOL.trim() !== password) {
            throw new BadRequestError_1.default({ code: 401, message: "Contraseña incorrecta", logging: true });
        }
        const isExpired = await isSubscriptionExpired(Vigencia);
        if (isExpired) {
            throw new BadRequestError_1.default({ code: 401, message: "Cuenta de usuario vencida", logging: true });
        }
        const datosDelUsuario = {
            Id: user.Id_UsuarioOOL.trim(),
            Nombre: user.Nombre.trim(),
            Serverweb: ServidorSQL.trim(),
            Baseweb: BaseSQL.trim(),
            Id_Cliente: user.Id_Cliente || 0,
            Id_ListPre,
            Vigencia: Vigencia,
            SwImagenes: user.SwImagenes,
            SwSinStock: user.SwSinStock,
            SwsinPrecio,
            TipoDocOO,
            TipoUsuario: user.TipoUsuario,
            Id_Almacen: user.Id_Almacen,
            Id_Usuario: UsuarioSQL,
            PrecioIncIVA: 0,
            from: 'web'
        };
        req.session.userWeb = datosDelUsuario;
        // Generar token JWT
        const token = await (0, generate_jwt_1.generateWebJWT)({ Id: user.Id_UsuarioOOL.trim(), sessionRedis: req.sessionID });
        return res.json({
            user: {
                ...datosDelUsuario,
                Id_ListPre
            },
            token
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginWeb = loginWeb;
const renewWeb = async (req, res, next) => {
    // Get session from REDIS.
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Id, TipoUsuario, Serverweb, Baseweb } = userFR;
    try {
        if (!Id && !TipoUsuario) {
            return res.status(401).json({ message: 'Id and rol are neccessary' });
        }
        ;
        if (!Serverweb && !Baseweb) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        }
        ;
        let token;
        token = await (0, generate_jwt_1.generateWebJWT)({ Id, sessionRedis: req.sessionID });
        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        }
        ;
        res.json({
            user: userFR,
            token
        });
    }
    catch (error) {
        next(error);
    }
};
exports.renewWeb = renewWeb;
const logout = async (req, res, next) => {
    const sessionId = req.sessionRedis;
    if (!sessionId) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    try {
        await (0, database_1.closeDbConnection)();
        await (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
//Utils
const getUserByEmailWeb = async (mainPool, email) => {
    const query_DB = database_1.querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
    const user = result?.recordset[0];
    if (!user) {
        throw new BadRequestError_1.default({ code: 401, message: "Usuario no encontrado", logging: true });
    }
    return user;
};
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=authWeb.js.map