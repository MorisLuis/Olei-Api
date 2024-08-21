"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renewLogin = exports.renewDB = exports.login = exports.loginDB = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const config_1 = __importDefault(require("../../config"));
const moment_1 = __importDefault(require("moment"));
const storageApp_1 = require("../../Storage/storageApp");
const mssql_1 = __importDefault(require("mssql"));
const loginDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // STEP 1 - CONNECT TO OLIEDB1_CLIENTES
    const mainPool = yield (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }
    try {
        const { IdUsuarioOLEI, PasswordOLEI } = req.body;
        if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
            return res.status(400).json({ error: 'Necesario enviar usuario y contraseña' });
        }
        const query_DB = database_1.querys.authDatabase;
        const result = yield mainPool.request().input('IdUsuarioOLEI', IdUsuarioOLEI).query(query_DB);
        console.log({ result });
        const cleanResult = result === null || result === void 0 ? void 0 : result.recordset[0];
        console.log({ cleanResult });
        if (!cleanResult) {
            return res.status(401).json({ error: `No se encontro el usuario: ${IdUsuarioOLEI}` });
        }
        if (cleanResult.PasswordOLEI.trim() !== PasswordOLEI) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        const user = {
            ServidorSQL: cleanResult.ServidorSQL,
            BaseSQL: cleanResult.BaseSQL,
            RazonSocial: cleanResult.RazonSocial
        };
        const tokenDB = yield (0, generate_jwt_1.generateJWTDB)({
            serverclientes: cleanResult.ServidorSQL.trim(),
            baseclientes: cleanResult.BaseSQL.trim(),
            IdUsuarioOLEI: cleanResult.IdUsuarioOLEI.trim()
        });
        const dataDB = {
            RazonSocial: cleanResult.RazonSocial,
            SwImagenes: cleanResult.SwImagenes,
            Vigencia: cleanResult.Vigencia
        };
        (0, storageApp_1.setClienteData)(cleanResult.IdUsuarioOLEI, dataDB);
        return res.json({
            tokenDB,
            user,
            userDB: {
                servidor: cleanResult.ServidorSQL,
                database: cleanResult.BaseSQL
            }
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.loginDB = loginDB;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serverclientes = req.serverclientes;
    const baseclientes = req.baseclientes;
    // STEP 1 - LOGIN
    const mainPool = yield (0, database_1.dbConnection)(serverclientes, baseclientes);
    if (!mainPool) {
        return res.status(500).json({ error: 'Error connecting to the main database' });
    }
    try {
        // Search for the user in the database using their email.
        const { Id_Usuario, password } = req.body;
        if (Id_Usuario.trim() === "" || password.trim() === "") {
            return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
        }
        const request = mainPool.request();
        request.input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario);
        request.input('Password', mssql_1.default.VarChar(50), password);
        const resultData = yield request.execute('sp_AuthenticateAndGetMovement');
        const Validations = resultData.recordsets[0];
        if (Validations[0].Tipo === "usuario" && Validations[0].Resultado !== 1) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }
        if (Validations[1].Tipo === "contrasena" && Validations[1].Resultado !== 1) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        const User = resultData.recordsets[1][0];
        const token = yield (0, generate_jwt_1.generateJWT)({
            id: Id_Usuario.trim(),
            rol: User.Id_Perfil,
            server: serverclientes,
            base: baseclientes
        });
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
});
exports.login = login;
const renewDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serverclientes = req.serverclientes;
    const baseclientes = req.baseclientes;
    const IdUsuarioOLEI = req.IdUsuarioOLEI;
    try {
        if (!serverclientes && !baseclientes) {
            return res.status(401).json({ message: 'UserDB not authenticated' });
        }
        ;
        const token = yield (0, generate_jwt_1.generateJWTDB)({
            serverclientes: serverclientes,
            baseclientes: baseclientes,
            IdUsuarioOLEI
        });
        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        }
        ;
        //To get 'Vigencia', SwImagenes and 'RazonSocial'.
        const dataFromDatabase = (0, storageApp_1.getClienteData)(IdUsuarioOLEI);
        const user = {
            ServidorSQL: serverclientes,
            BaseSQL: baseclientes,
            Vigencia: dataFromDatabase === null || dataFromDatabase === void 0 ? void 0 : dataFromDatabase.Vigencia,
            SwImagenes: dataFromDatabase === null || dataFromDatabase === void 0 ? void 0 : dataFromDatabase.SwImagenes,
            RazonSocial: dataFromDatabase === null || dataFromDatabase === void 0 ? void 0 : dataFromDatabase.RazonSocial
        };
        if (!user) {
            return res.status(401).json({ message: 'User data is neccesary' });
        }
        ;
        if (!(dataFromDatabase === null || dataFromDatabase === void 0 ? void 0 : dataFromDatabase.Vigencia)) {
            return res.status(401).json({ error: 'Necesario tener una cuenta vigente' });
        }
        ;
        // Get the user's subscription expiration date.
        const dueDate = yield isSubscriptionExpired(dataFromDatabase === null || dataFromDatabase === void 0 ? void 0 : dataFromDatabase.Vigencia);
        if (dueDate) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }
        res.json({
            token,
            user
        });
    }
    catch (error) {
        res.status(500).send(error.message);
        console.log({ error });
    }
});
exports.renewDB = renewDB;
const renewLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const userRol = req.rol;
    const server = req.server;
    const base = req.base;
    try {
        if (!userId && !userRol) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        ;
        if (!server && !base) {
            return res.status(401).json({ message: 'Server and base data is neccessary' });
        }
        ;
        const token = yield (0, generate_jwt_1.generateJWT)({
            id: userId,
            rol: userRol,
            server,
            base
        });
        if (!token) {
            return res.status(401).json({ message: 'Failed to generate token' });
        }
        ;
        // Get user data.
        const mainPool = yield (0, database_1.dbConnection)(server, base);
        const userDB = yield getUserByEmail(mainPool, userId);
        const user = Object.assign(Object.assign({}, userDB), { ServidorSQL: server, BaseSQL: base });
        if (!userDB) {
            return res.status(401).json({ message: 'User data is neccesary' });
        }
        ;
        res.json({
            user,
            token
        });
    }
    catch (error) {
        console.log({ error });
        res.status(500).send(error.message);
    }
});
exports.renewLogin = renewLogin;
// Utils
const getUserByEmail = (mainPool, Id_Usuario) => __awaiter(void 0, void 0, void 0, function* () {
    const query_DB = database_1.querys.auth;
    const result = yield mainPool.request().input('Id_Usuario', Id_Usuario.trim()).query(query_DB);
    return result === null || result === void 0 ? void 0 : result.recordset[0];
});
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=auth.js.map