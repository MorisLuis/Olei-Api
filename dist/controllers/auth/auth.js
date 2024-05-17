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
exports.renew = exports.login = exports.loginDB = void 0;
const database_1 = require("../../database");
const generate_jwt_1 = require("../../helpers/generate-jwt");
const __1 = require("../..");
const config_1 = __importDefault(require("../../config"));
const loginDB = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { servidor, database } = req.body;
        console.log({ servidor, database });
        // STEP 1 - LOGIN
        const mainPool = yield (0, database_1.dbConnection)(servidor, database);
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        const tokenDB = yield (0, generate_jwt_1.generateJWTDB)({ servidor, database });
        console.log({ tokenDB });
        __1.sharedData.userConnection = {
            connection: {
                user: config_1.default.dbUser,
                password: config_1.default.dbPassword,
                server: mainPool['config'].server,
                database: mainPool['config'].database
            }
        };
        console.log({
            servidor,
            database
        });
        return res.json({
            tokenDB,
            userDB: {
                servidor,
                database
            }
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
});
exports.loginDB = loginDB;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // STEP 1 - LOGIN
        const mainPool = yield (0, database_1.dbConnection)((_a = __1.sharedData.userConnection) === null || _a === void 0 ? void 0 : _a.connection.server, (_b = __1.sharedData.userConnection) === null || _b === void 0 ? void 0 : _b.connection.database);
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        // Search for the user in the database using their email.
        const { email, password } = req.body;
        const user = yield getUserByEmail(mainPool, email);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrada' });
        }
        if (user.Password.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        // Get the user's subscription expiration date.
        /* const dueDate = await getUserSubscriptionDueDate(mainPool, user.Id_ClienteDBCLIENTES);
        if (isSubscriptionExpired(dueDate)) {
            return res.status(401).json({ error: 'Subscripción ha expirado' });
        } */
        const token = yield (0, generate_jwt_1.generateJWT)({ id: user.EMail, rol: user.Id_Perfil });
        // Update sharedData.userConnection for global access.
        __1.sharedData.userConnection = {
            connection: {
                user: config_1.default.dbUser,
                password: config_1.default.dbPassword,
                server: (_c = __1.sharedData.userConnection) === null || _c === void 0 ? void 0 : _c.connection.server,
                database: (_d = __1.sharedData.userConnection) === null || _d === void 0 ? void 0 : _d.connection.database
            }
        };
        return res.json({
            user,
            token
        });
    }
    catch (error) {
        console.log({ error });
        return res.status(500).send(error.message);
    }
});
exports.login = login;
const renew = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const user = (_e = __1.sharedData === null || __1.sharedData === void 0 ? void 0 : __1.sharedData.userConnection) === null || _e === void 0 ? void 0 : _e.connection;
    try {
        if (!user)
            return;
        const token = yield (0, generate_jwt_1.generateJWTDB)({ servidor: user.server, database: user.database });
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
//# sourceMappingURL=auth.js.map