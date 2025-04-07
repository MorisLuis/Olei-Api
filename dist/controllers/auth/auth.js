"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.logoutServer = exports.logoutUser = exports.login = exports.loginServer = void 0;
const authAppServices_1 = require("../../services/authAppServices");
const CustomError_1 = require("../../errors/CustomError");
const uuid_1 = require("uuid");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const generate_redis_1 = require("../../helpers/generate-redis");
const loginServer = async (req, res, next) => {
    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;
        const { result } = await (0, authAppServices_1.loginDBAppService)({
            IdUsuarioOLEI,
            PasswordOLEI
        });
        // Session redis
        const datosDelUsuario = {
            ServidorSQL: result.ServidorSQL.trim(),
            BaseSQL: result.BaseSQL.trim(),
            UsuarioSQL: result.UsuarioSQL.trim(),
            PasswordSQL: result.PasswordSQL.trim(),
            IdUsuarioOLEI: result.IdUsuarioOLEI.trim(),
            PasswordOLEI: result.PasswordOLEI,
            RazonSocial: result.RazonSocial.trim(),
            SwImagenes: result.SwImagenes,
            Vigencia: result.Vigencia,
            from: 'mobil',
            userConected: false,
            serverConected: true
        };
        // Generar un ID de sesión único
        const sessionId = (0, uuid_1.v4)();
        // Guardar la sesión en Redis con expiración (1 hora)
        await (0, generate_redis_1.generateRedisSession)(sessionId, datosDelUsuario);
        // Generar el token JWT que incluye el sessionId
        const token = (0, generate_jwt_1.generateAccessToken)(sessionId);
        const refreshToken = (0, generate_jwt_1.generateRefreshToken)(sessionId);
        return res.json({
            user: datosDelUsuario,
            token,
            refreshToken
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginServer = loginServer;
const login = async (req, res, next) => {
    try {
        const session = req.session;
        const sessionId = req.sessionId;
        const { Id_Usuario, password } = req.body;
        const { userData } = await (0, authAppServices_1.loginAppService)({
            Id_Usuario,
            password,
            session
        });
        const datosDelUsuario = {
            ...session,
            userId: Id_Usuario.trim(),
            userRol: userData.Id_Perfil,
            TodosAlmacenes: userData.TodosAlmacenes,
            SalidaSinExistencias: userData.SalidaSinExistencias,
            Id_Almacen: userData.Id_Almacen,
            Id_ListPre: userData.Id_ListPre,
            AlmacenNombre: userData.AlmacenNombre,
            serverConected: session.serverConected,
            userConected: true,
        };
        await (0, generate_redis_1.updateSession)(sessionId, datosDelUsuario);
        return res.json({
            user: datosDelUsuario
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logoutServer = async (req, res, next) => {
    try {
        const sessionId = req.sessionId;
        if (!sessionId)
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        await (0, generate_redis_1.handleDeleteRedisSession)(sessionId);
        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.logoutServer = logoutServer;
const logoutUser = async (req, res, next) => {
    try {
        const sessionUser = req.session;
        const sessionId = req.sessionId;
        if (!sessionUser) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const datosDelUsuario = {
            ...sessionUser,
            userConected: false
        };
        await (0, generate_redis_1.updateSession)(sessionId, datosDelUsuario);
        return res.json({
            user: datosDelUsuario
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutUser = logoutUser;
const refresh = async (req, res, next) => {
    try {
        const session = req.session;
        const sessionId = req.sessionId;
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No hay refresh token" });
        }
        // Guardar la sesión en Redis con expiración (1 hora)
        await (0, generate_redis_1.generateRedisSession)(sessionId, session);
        // Generar el token JWT que incluye el sessionId
        const newToken = (0, generate_jwt_1.generateAccessToken)(sessionId);
        const newRefreshToken = (0, generate_jwt_1.generateRefreshToken)(sessionId);
        res.json({
            token: newToken,
            user: session,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
//# sourceMappingURL=auth.js.map