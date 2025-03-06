"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.renewWeb = exports.loginWeb = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const authServices_1 = require("../../services/authServices");
const CustomError_1 = require("../../errors/CustomError");
const loginWeb = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await (0, authServices_1.loginWebService)(email, password);
        const { Id_UsuarioOOL, Nombre, Id_Cliente, SwImagenes, SwSinStock, TipoUsuario, Id_Almacen } = user;
        const datosDelUsuario = {
            Id: Id_UsuarioOOL.trim(),
            Nombre: Nombre.trim(),
            Serverweb: ServidorSQL.trim(),
            Baseweb: BaseSQL.trim(),
            Id_Cliente: Id_Cliente || 0,
            Id_ListPre,
            Vigencia: Vigencia,
            SwImagenes: SwImagenes,
            SwSinStock: SwSinStock,
            SwsinPrecio,
            TipoDocOO,
            TipoUsuario: TipoUsuario,
            Id_Almacen: Id_Almacen,
            Id_Usuario: UsuarioSQL,
            PrecioIncIVA: 0,
            from: 'web'
        };
        req.session.userWeb = datosDelUsuario;
        // Generar token JWT
        const token = await (0, generate_jwt_1.generateWebJWT)({ Id: user.Id_UsuarioOOL.trim(), sessionRedis: req.sessionID });
        return res.json({
            user: datosDelUsuario,
            token
        });
    }
    catch (error) {
        next(error);
    }
};
exports.loginWeb = loginWeb;
const renewWeb = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
        if (!userFR) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        const { Id, TipoUsuario, Serverweb, Baseweb } = userFR;
        if (!Id && !TipoUsuario) {
            return res.status(401).json({ message: 'Id and rol are neccessary' });
        }
        ;
        if (!Serverweb && !Baseweb) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        }
        ;
        let token;
        token = await (0, generate_jwt_1.generateWebJWT)({ Id, sessionRedis: sessionId });
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
    try {
        const sessionId = req.sessionRedis;
        if (!sessionId) {
            throw new CustomError_1.UnauthorizedError('Sesion terminada');
        }
        await (0, database_1.closeDbConnection)();
        await (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
//# sourceMappingURL=authWeb.js.map