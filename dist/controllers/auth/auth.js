"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutDB = exports.logoutUser = exports.renewLogin = exports.renewDB = exports.login = exports.loginDB = void 0;
const generate_jwt_1 = require("../../helpers/generate-jwt");
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const authAppServices_1 = require("../../services/authAppServices");
const CustomError_1 = require("../../errors/CustomError");
// login global server
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
        console.log("session", req.sessionID);
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
const renewDB = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { BaseSQL, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;
        const token = await (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI });
        if (!token) {
            throw new CustomError_1.UnauthorizedError('Error al generar token');
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
            throw new CustomError_1.ValidationError('Información del usuario es necesaria');
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
const logoutDB = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        if (!sessionId) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        await (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutDB = logoutDB;
// login
const login = async (req, res, next) => {
    try {
        const { Id_Usuario, password } = req.body;
        const sessionId = req.sessionID;
        const { userData } = await (0, authAppServices_1.loginAppService)({
            Id_Usuario,
            password,
            sessionId
        });
        const token = await (0, generate_jwt_1.generateJWT)({ Id_mobile: Id_Usuario.trim() });
        if (!req.session.user) {
            throw new CustomError_1.UnauthorizedError('User session is not defined');
        }
        const datosDelUsuario = {
            ...(req.session).user,
            userId: Id_Usuario.trim(),
            userRol: userData.Id_Perfil,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            AlmacenNombre: userData.AlmacenNombre,
            Id_ListPre: userData.Id_ListPre,
            ServidorSQL: req.session.user.ServidorSQL ?? '',
            BaseSQL: req.session.user.BaseSQL ?? '',
            UsuarioSQL: req.session.user.UsuarioSQL ?? '',
            PasswordSQL: req.session.user.PasswordSQL ?? '',
            IdUsuarioOLEI: req.session.user.IdUsuarioOLEI ?? '',
            RazonSocial: req.session.user.RazonSocial ?? '',
            SwImagenes: req.session.user.SwImagenes ?? '',
            Vigencia: req.session.user.Vigencia ?? '',
            from: req.session.user.from ?? 'mobil'
        };
        // Session redis
        req.session.user = datosDelUsuario;
        const userStorage = {
            Id_Usuario,
            TodosAlmacenes: userData.TodosAlmacenes,
            Id_Almacen: userData.Id_Almacen,
            AlmacenNombre: userData.AlmacenNombre,
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
const renewLogin = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { ServidorSQL, BaseSQL, userId, userRol, TodosAlmacenes } = userFR;
        if (!userId || !userRol) {
            throw new CustomError_1.ValidationError('userId y userRol son necesarios');
        }
        ;
        if (!ServidorSQL || !BaseSQL) {
            throw new CustomError_1.ValidationError('ServidorSQL y BaseSQL son necesarios');
        }
        ;
        const token = await (0, generate_jwt_1.generateJWT)({ Id_mobile: userId });
        if (!token) {
            throw new CustomError_1.UnauthorizedError('Error al generar token');
        }
        ;
        const user = {
            Id_Usuario: userId,
            TodosAlmacenes,
            Id_Almacen: userFR.Id_Almacen,
            AlmacenNombre: userFR.AlmacenNombre,
            Id_ListPre: userFR.Id_ListPre
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
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        if (!req.session.user) {
            throw new CustomError_1.UnauthorizedError('User session is not defined');
        }
        const datosDelUsuario = {
            ...req.session.user,
            userId: undefined,
            userRol: undefined,
            TodosAlmacenes: undefined,
            Id_Almacen: undefined,
            AlmacenNombre: undefined,
            SalidaSinExistencias: 0,
            Id_ListPre: undefined,
            ServidorSQL: req.session.user.ServidorSQL ?? '',
            BaseSQL: req.session.user.BaseSQL ?? '',
            UsuarioSQL: req.session.user.UsuarioSQL ?? '',
            PasswordSQL: req.session.user.PasswordSQL ?? '',
            IdUsuarioOLEI: req.session.user.IdUsuarioOLEI ?? '',
            RazonSocial: req.session.user.RazonSocial ?? '',
            SwImagenes: req.session.user.SwImagenes ?? '',
            Vigencia: req.session.user.Vigencia ?? '',
            from: req.session.user.from ?? 'mobil'
        };
        req.session.user = datosDelUsuario;
        return res.json({
            user: datosDelUsuario
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=auth.js.map