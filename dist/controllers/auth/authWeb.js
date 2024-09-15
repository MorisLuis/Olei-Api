"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.renewWeb = exports.loginWeb = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const config_1 = __importDefault(require("../../config"));
const moment_1 = __importDefault(require("moment"));
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const loginWeb = async (req, res) => {
    const { email, password } = req.body;
    console.log({ req: req.headers });
    if (email === "" || password === "") {
        return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
    }
    try {
        const mainPool = await (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }
        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        const isExpired = await isSubscriptionExpired(Vigencia);
        if (isExpired) {
            return res.status(401).json({ error: 'Cuenta de usuario vencida.' });
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
            PrecioIncIVA: 0
        };
        const sessionId1 = req.sessionID;
        console.log({ sessionId1 });
        req.session.userWeb = datosDelUsuario;
        const sessionId2 = req.sessionID;
        console.log({ sessionId2 });
        // Generar token JWT
        const token = await (0, generate_jwt_1.generateWebJWT)({ Id: user.Id_UsuarioOOL.trim() });
        return res.json({
            user: {
                ...user,
                Id_ListPre
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.loginWeb = loginWeb;
const renewWeb = async (req, res) => {
    console.log("renewweb");
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
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
        token = await (0, generate_jwt_1.generateWebJWT)({ Id });
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
        console.log({ errorRW: error });
        res.status(500).send(error.message);
    }
};
exports.renewWeb = renewWeb;
const logout = async (req, res) => {
    const sessionId = req.sessionID;
    if (!sessionId) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    try {
        await (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        res.json({ ok: true });
    }
    catch (error) {
        console.log({ error });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.logout = logout;
//Utils
const getUserByEmailWeb = async (mainPool, email) => {
    const query_DB = database_1.querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
    return result?.recordset[0];
};
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=authWeb.js.map