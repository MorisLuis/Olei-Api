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
const __1 = require("..");
const config_1 = __importDefault(require("../config"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // STEP 1 - LOGIN
        const mainPool = yield (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        // Search for the user in the database using their email.
        const { email, password } = req.body;
        const user = yield getUserByEmail(mainPool, email);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrada' });
        }
        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        // Get the user's subscription expiration date.
        const dueDate = yield getUserSubscriptionDueDate(mainPool, user.Id_ClienteDBCLIENTES);
        if (isSubscriptionExpired(dueDate)) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        }
        const token = yield (0, generate_jwt_1.generateJWT)({ id: user.Id_UsuarioOOL, rol: user.TipoUsuario });
        // Get user database connection details.
        const otherDBServer = user.ServidorSQL.trim();
        const otherDBDatabase = user.BaseSQL.trim();
        // Update sharedData.userConnection for global access.
        __1.sharedData.userConnection = {
            connection: {
                user: config_1.default.dbUser,
                password: config_1.default.dbPassword,
                server: otherDBServer,
                database: otherDBDatabase
            }
        };
        yield mainPool.close();
        // STEP 2 - CONNECT THE COMPANY DATABASE
        // Connect to the user's database.
        const otherDBConnection = yield connectToUserDatabase(user);
        return res.json({
            otherDBServer,
            otherDBDatabase,
            user: otherDBConnection.currentUser,
            token
        });
    }
    catch (error) {
        console.log({ error });
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
    var _a;
    const user = (_a = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.currentUser) === null || _a === void 0 ? void 0 : _a.user;
    try {
        if (!user)
            return;
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
// Utils
const getUserByEmail = (mainPool, email) => __awaiter(void 0, void 0, void 0, function* () {
    const query_DB = database_1.querys.auth;
    const result = yield mainPool.request().input('email', email).query(query_DB);
    return result === null || result === void 0 ? void 0 : result.recordset[0];
});
const getUserSubscriptionDueDate = (mainPool, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const query_CLIENTES = `SELECT * FROM [OLEIDB1_CLIENTES].[dbo].[CLIENTES] WHERE Id_Cliente = @clienteId`;
    const resultCliente = yield mainPool.request().input('clienteId', clientId).query(query_CLIENTES);
    return resultCliente === null || resultCliente === void 0 ? void 0 : resultCliente.recordset[0].Vigencia;
});
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
const connectToUserDatabase = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const otherPool = yield (0, database_1.dbConnection)(user.ServidorSQL.trim(), user.BaseSQL.trim());
        const query_DB = database_1.querys.authCompany;
        const idListPreResult = yield otherPool.request()
            .input('Id_Cliente', user.Id_Cliente ? user.Id_Cliente : 1)
            .input("IdOLEI", user.IdOLEI)
            .query(query_DB);
        const Id_ListPre = (_b = idListPreResult === null || idListPreResult === void 0 ? void 0 : idListPreResult.recordset[0]) === null || _b === void 0 ? void 0 : _b.Id_ListPre;
        const Nombre = (_c = idListPreResult === null || idListPreResult === void 0 ? void 0 : idListPreResult.recordset[0]) === null || _c === void 0 ? void 0 : _c.Nombre;
        const TypeOfMovementsResult = yield otherPool.request().query(database_1.querys.getTypeOfMovementInitial);
        const TypeOfMovements = TypeOfMovementsResult.recordset[0];
        __1.sharedData.currentUser = {
            user: Object.assign(Object.assign({}, user), { Id_ListPre,
                Nombre, Id_TipoMovInv: {
                    Id_TipoMovInv: TypeOfMovements.Id_TipoMovInv,
                    Accion: TypeOfMovements.Accion,
                    Descripcion: TypeOfMovements.Descripcion,
                    Id_AlmDest: TypeOfMovements.Id_AlmDest
                } })
        };
        __1.sharedData.currentClient = {
            client: {
                Id_Almacen: user.Id_Almacen,
                Id_Cliente: user.Id_Cliente,
                Id_ListPre
            }
        };
        return {
            server: user.ServidorSQL.trim(),
            database: user.BaseSQL.trim(),
            pool: otherPool,
            currentUser: __1.sharedData.currentUser.user
        };
    }
    catch (error) {
        console.error("Error en connectToUserDatabase:", error);
        throw error;
    }
});
//# sourceMappingURL=auth.js.map