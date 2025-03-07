"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAppService = exports.loginDBAppService = void 0;
const database_1 = require("../database");
const CustomError_1 = require("../errors/CustomError");
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const loginDBAppService = async ({ IdUsuarioOLEI, PasswordOLEI }) => {
    // Connection to server
    const mainPool = await (0, database_1.dbConnectionMain)();
    if (!mainPool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        throw new CustomError_1.ValidationError('Necesario enviar usuario y contraseña');
    }
    // Get data from DB.
    const query_DB = database_1.querys.authDatabase;
    const resp = await mainPool
        .request()
        .input('IdUsuarioOLEI', IdUsuarioOLEI)
        .query(query_DB);
    const result = resp?.recordset[0];
    if (!result) {
        throw new CustomError_1.NotFoundError(`No se encontro el usuario: ${IdUsuarioOLEI}`);
    }
    if (result?.PasswordOLEI && result?.PasswordOLEI.trim() !== PasswordOLEI) {
        throw new CustomError_1.UnauthorizedError(`Contraseña incorrecta ${IdUsuarioOLEI}`);
    }
    return {
        result
    };
};
exports.loginDBAppService = loginDBAppService;
const loginAppService = async ({ sessionId, Id_Usuario, password }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    if (Id_Usuario.trim() === "" || password.trim() === "") {
        throw new CustomError_1.ValidationError('Necesario escribir correo y contraseña');
    }
    const request = pool.request();
    request.input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario);
    request.input('Password', mssql_1.default.VarChar(50), password);
    const result = await request.execute('sp_AuthenticateAndGetMovement');
    const validations = result.recordsets[0];
    if (validations[0].Tipo === "usuario" && validations[0].Resultado !== 1) {
        throw new CustomError_1.NotFoundError('Correo no encontrado');
    }
    ;
    if (validations[1].Tipo === "contrasena" && validations[1].Resultado !== 1) {
        throw new CustomError_1.UnauthorizedError('Contraseña incorrecta');
    }
    ;
    const userData = result.recordsets[1][0];
    return {
        userData: {
            ...userData
        }
    };
};
exports.loginAppService = loginAppService;
//# sourceMappingURL=authAppServices.js.map