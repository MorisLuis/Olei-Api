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
exports.renew = exports.logout = exports.login = void 0;
const database_1 = require("../database");
const moment_1 = __importDefault(require("moment"));
const generate_jwt_1 = require("../helpers/generate-jwt");
const app_1 = require("../app");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mainPool = yield (0, database_1.dbConnection)();
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        const { email, password } = req.body;
        // Search for the user in the database using their email.
        const query_DB = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[USUARIOSOOL] WHERE Id_UsuarioOOL = @email`;
        const result = yield mainPool.request().input('email', email).query(query_DB);
        const user = result === null || result === void 0 ? void 0 : result.recordset[0];
        // Update sharedData.currentUser for global access.
        app_1.sharedData.currentUser = { user };
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }
        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        // Get the user's subscription expiration date.
        const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
        const resultCliente = yield mainPool.request().input('clienteId', user.Id_ClienteDBCLIENTES).query(query_CLIENTES);
        const dueDate = resultCliente === null || resultCliente === void 0 ? void 0 : resultCliente.recordset[0].Vigencia;
        // Compare the expiration date with today.
        const today = (0, moment_1.default)().startOf('day');
        const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
        if (isExpired) {
            return res.status(401).json({ error: 'Subscription has expired' });
        }
        // Generate a JWT token for the user.
        const token = yield (0, generate_jwt_1.generateJWT)({ id: user.Id_UsuarioOOL, rol: user.TipoUsuario });
        // Get user database connection details.
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();
        // Close the connection to the main database.
        yield mainPool.close();
        let otherPool;
        // Connect to the user's database.
        try {
            otherPool = yield (0, database_1.dbConnection)(otherDBServer, otherDBDatabase);
        }
        catch (error) {
            return res.status(500).send(error.message);
        }
        return res.json({
            otherDBServer,
            otherDBDatabase,
            user,
            token,
            otherPool
        });
    }
    catch (error) {
        return res.status(500).send(error.message);
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.closeDbConnection)();
        const server = "babs4kdofr.database.windows.net";
        const database = "OLEIDB1_CLIENTES";
        const pool = yield (0, database_1.dbConnection)(server, database);
        const connectionStatus = (pool === null || pool === void 0 ? void 0 : pool.connected) ? 'Connected' : 'Not Connected';
        res.json({
            status: connectionStatus,
            pool
        });
    }
    catch (error) {
        console.log({ error });
    }
});
exports.logout = logout;
const renew = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const email = ((_a = req.id) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    const user = (_b = app_1.sharedData === null || app_1.sharedData === void 0 ? void 0 : app_1.sharedData.currentUser) === null || _b === void 0 ? void 0 : _b.user;
    try {
        const token = yield (0, generate_jwt_1.generateJWT)({ id: user.Id_UsuarioOOL, rol: user.TipoUsuario });
        res.json({
            user,
            token
        });
    }
    catch (error) {
        res.status(500).send(error.message);
        console.log({ error });
    }
});
exports.renew = renew;
//# sourceMappingURL=auth.js.map