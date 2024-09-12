"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutDB = exports.logoutUser = exports.renewLogin = exports.renewDB = exports.login = exports.loginDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const config_1 = __importDefault(require("../../config"));
const getSession_1 = require("../../utils/Redis/getSession");
const deleteRedis_1 = require("../../utils/Redis/deleteRedis");
const loginDB = async (req, res) => {
    // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
    const { IdUsuarioOLEI, PasswordOLEI } = req.body;
    const mainPool = await (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }
    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        return res.status(400).json({ error: 'Necesario enviar usuario y contraseña' });
    }
    try {
        const query_DB = database_1.querys.authDatabase;
        const result = await mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        const cleanResult = result?.recordset[0];
        if (!cleanResult) {
            return res.status(401).json({ error: `No se encontro el usuario: ${IdUsuarioOLEI}` });
        }
        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        const user = {
            BaseSQL: cleanResult.BaseSQL,
            RazonSocial: cleanResult.RazonSocial
        };
        const tokenDB = await (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim() });
        req.session.user = {
            serverclientes: cleanResult.ServidorSQL.trim(),
            baseclientes: cleanResult.BaseSQL.trim(),
            UsuarioSQL: cleanResult.UsuarioSQL.trim(),
            PasswordSQL: cleanResult.PasswordSQL.trim(),
            IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim(),
            RazonSocial: cleanResult.RazonSocial.trim(),
            SwImagenes: cleanResult.SwImagenes,
            Vigencia: cleanResult.Vigencia,
            userId: undefined,
            userRol: undefined
        };
        return res.json({
            tokenDB,
            user
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.loginDB = loginDB;
const login = async (req, res) => {
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
    // STEP 1 - LOGIN
    const mainPool = await (0, database_1.dbConnection)(serverclientes, baseclientes, PasswordSQL, UsuarioSQL);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }
    try {
        const result = await mainPool.request().query("SELECT *   FROM [dbo].[USUARIOS]");
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;
        if (Id_Usuario.trim() === "" || password.trim() === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }
        const request = mainPool.request();
        request.input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario);
        request.input('Password', mssql_1.default.VarChar(50), password);
        const resultData = await request.execute('sp_AuthenticateAndGetMovement');
        const Validations = resultData.recordsets[0];
        if (Validations[0].Tipo === "usuario" && Validations[0].Resultado !== 1) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }
        if (Validations[1].Tipo === "contrasena" && Validations[1].Resultado !== 1) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
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
        console.log({ error });
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
};
exports.login = login;
const renewDB = async (req, res) => {
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { baseclientes, IdUsuarioOLEI, RazonSocial, userId, userRol } = userFR;
    try {
        const token = await (0, generate_jwt_1.generateJWTDB)({ IdUsuarioOLEI });
        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
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
            return res.status(401).json({ message: 'User data is neccesary' });
        }
        ;
        req.session.user = userRedis;
        res.json({
            token,
            user
        });
    }
    catch (error) {
        res.status(500).send(error.message);
        console.log({ error });
    }
    finally {
        await (0, database_1.closeDbConnection)();
    }
};
exports.renewDB = renewDB;
const renewLogin = async (req, res) => {
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    const { serverclientes, baseclientes, userId, userRol } = userFR;
    try {
        if (!userId && !userRol) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        ;
        if (!serverclientes && !baseclientes) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        }
        ;
        const token = await (0, generate_jwt_1.generateJWT)({ id: userId });
        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
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
        console.log({ error });
        res.status(500).send(error.message);
    }
};
exports.renewLogin = renewLogin;
const logoutUser = async (req, res) => {
    const sessionId = req.sessionID;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    try {
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
        console.log({ error });
        res.status(500).send(error.message);
    }
};
exports.logoutUser = logoutUser;
const logoutDB = async (req, res) => {
    const sessionId = req.sessionID;
    if (!sessionId) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    try {
        await (0, deleteRedis_1.handleDeleteRedisSession)({ sessionId });
        await (0, database_1.closeDbConnection)();
        res.json({ ok: true });
    }
    catch (error) {
        console.log({ error });
        res.status(500).send(error.message);
    }
};
exports.logoutDB = logoutDB;
//# sourceMappingURL=auth.js.map