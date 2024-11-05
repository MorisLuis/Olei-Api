"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWebService = void 0;
const database_1 = require("../database");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const moment_1 = __importDefault(require("moment"));
const loginWebService = async (email, password) => {
    if (email === "" || password === "") {
        throw new BadRequestError_1.default({ code: 401, message: "Necesario escribir correo y contraseña", logging: true });
    }
    ;
    const mainPool = await (0, database_1.dbConnectionMain)();
    if (!mainPool) {
        throw new BadRequestError_1.default({ code: 500, message: "Error connecting to the main database", logging: true });
    }
    const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);
    if (!user) {
        throw new BadRequestError_1.default({ code: 401, message: "Correo no encontrado", logging: true });
    }
    if (user.PasswordOOL.trim() !== password) {
        throw new BadRequestError_1.default({ code: 401, message: "Contraseña incorrecta", logging: true });
    }
    const isExpired = await isSubscriptionExpired(Vigencia);
    if (isExpired) {
        throw new BadRequestError_1.default({ code: 401, message: "Cuenta de usuario vencida", logging: true });
    }
    return {
        SwsinPrecio,
        TipoDocOO,
        ServidorSQL,
        BaseSQL,
        Vigencia,
        Id_ListPre,
        UsuarioSQL,
        ...user
    };
};
exports.loginWebService = loginWebService;
// Utils
const getUserByEmailWeb = async (mainPool, email) => {
    const query_DB = database_1.querys.authWeb;
    const result = await mainPool.request().input('email', email).query(query_DB);
    const user = result?.recordset[0];
    if (!user) {
        throw new BadRequestError_1.default({ code: 401, message: "Usuario no encontrado", logging: true });
    }
    return user;
};
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=authServices.js.map