"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWebService = void 0;
const database_1 = require("../database");
const moment_1 = __importDefault(require("moment"));
const CustomError_1 = require("../errors/CustomError");
const loginWebService = async (email, password) => {
    if (email === "" || password === "") {
        throw new CustomError_1.ValidationError('Necesario escribir correo y contraseña');
    }
    ;
    const mainPool = await (0, database_1.dbConnectionMain)();
    if (!mainPool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const { SwsinPrecio, TipoDocOO, ServidorSQL, BaseSQL, Vigencia, Id_ListPre, UsuarioSQL, ...user } = await getUserByEmailWeb(mainPool, email);
    if (!user) {
        throw new CustomError_1.NotFoundError(`No se encontro el usuario: ${email}`);
    }
    if (user.PasswordOOL.trim() !== password) {
        throw new CustomError_1.UnauthorizedError(`Contraseña incorrecta`);
    }
    const isExpired = await isSubscriptionExpired(Vigencia);
    if (isExpired) {
        throw new CustomError_1.UnauthorizedError(`Cuenta de usuario vencida`);
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
        throw new CustomError_1.NotFoundError(`No se encontro el usuario`);
    }
    return user;
};
const isSubscriptionExpired = (dueDate) => {
    const today = (0, moment_1.default)().startOf('day');
    const isExpired = (0, moment_1.default)(dueDate).startOf('day').isBefore(today);
    return isExpired;
};
//# sourceMappingURL=authServices.js.map