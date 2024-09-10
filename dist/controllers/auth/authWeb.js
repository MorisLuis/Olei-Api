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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
const loginWeb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email === "" || password === "") {
        return res.status(400).json({ error: 'Necesario escribir correo y contraseña' });
    }
    try {
        const mainPool = yield (0, database_1.dbConnection)(config_1.default.dbServer, config_1.default.dbDatabase);
        if (!mainPool) {
            return res.status(500).json({ error: 'Error connecting to the main database' });
        }
        const _a = yield getUserByEmailWeb(mainPool, email), { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre } = _a, user = __rest(_a, ["SwsinPrecio", "TipoDocOO", "ServidorSQL", "BaseSQL", "Vigencia", "Id_ListPre"]);
        if (!user) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }
        if (user.PasswordOOL.trim() !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        const isExpired = yield isSubscriptionExpired(Vigencia);
        if (isExpired) {
            return res.status(401).json({ error: 'Cuenta de usuario vencida.' });
        }
        const datosDelUsuario = {
            Id: user.Id_UsuarioOOL.trim(),
            Nombre: user.Nombre.trim(),
            Serverweb: ServidorSQL.trim(),
            Baseweb: BaseSQL.trim(),
            Id_Cliente: user.Id_ClienteDBCLIENTES || 0,
            Id_ListPre,
            Vigencia: Vigencia,
            SwImagenes: user.SwImagenes,
            SwSinStock: user.SwSinStock,
            SwsinPrecio,
            TipoDocOO,
            TipoUsuario: user.TipoUsuario,
            Id_Almacen: user.Id_Almacen
        };
        req.session.user = datosDelUsuario;
        // Generar token JWT
        const token = yield (0, generate_jwt_1.generateWebJWT)({ Id: user.Id_UsuarioOOL.trim() });
        return res.json({
            user: Object.assign(Object.assign({}, user), { Id_ListPre }),
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: error.message || 'Unexpected error' });
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.loginWeb = loginWeb;
const renewWeb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("renewweb");
    // Get session from REDIS.
    const sessionId = req.sessionID;
    const { user: userFR } = yield (0, getSession_1.handleGetWebSession)({ sessionId });
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
        token = yield (0, generate_jwt_1.generateWebJWT)({ Id });
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
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.renewWeb = renewWeb;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.sessionID;
    if (!sessionId) {
        return res.status(400).json({ error: 'Sesion terminada' });
    }
    try {
        //await handleDeleteRedisSession({ sessionId });
        yield (0, database_1.closeDbConnection)();
        res.json({ ok: true });
    }
    catch (error) {
        console.log({ error });
    }
    finally {
        yield (0, database_1.closeDbConnection)();
    }
});
exports.logout = logout;
//Utils
const getUserByEmailWeb = (mainPool, email) => __awaiter(void 0, void 0, void 0, function* () {
    const query_DB = database_1.querys.authWeb;
    const result = yield mainPool.request().input('email', email).query(query_DB);
    return result === null || result === void 0 ? void 0 : result.recordset[0];
});
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=authWeb.js.map