"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAppService = exports.loginDBAppService = void 0;
const database_1 = require("../database");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const loginDBAppService = async ({ IdUsuarioOLEI, PasswordOLEI }) => {
    // Connection to server
    const mainPool = await (0, database_1.dbConnectionMain)();
    if (!mainPool) {
        throw new BadRequestError_1.default({ code: 400, message: "Error connecting to the main database!", logging: true });
    }
    if (IdUsuarioOLEI.trim() === "" || PasswordOLEI.trim() === "") {
        throw new BadRequestError_1.default({ code: 401, message: "Necesario enviar usuario y contraseña!", logging: true });
    }
    // Get data from DB.
    const query_DB = database_1.querys.authDatabase;
    const resp = await mainPool
        .request()
        .input('IdUsuarioOLEI', IdUsuarioOLEI)
        .query(query_DB);
    const result = resp?.recordset[0];
    if (!result) {
        throw new BadRequestError_1.default({ code: 404, message: `No se encontro el usuario: ${IdUsuarioOLEI}`, logging: true });
    }
    if (result?.PasswordOLEI && result?.PasswordOLEI.trim() !== PasswordOLEI) {
        throw new BadRequestError_1.default({ code: 404, message: `Contraseña incorrecta`, logging: true });
    }
    return {
        result
    };
};
exports.loginDBAppService = loginDBAppService;
const loginAppService = async ({ sessionId, Id_Usuario, password }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: "Error connecting to the main database", logging: true });
    }
    if (Id_Usuario.trim() === "" || password.trim() === "") {
        throw new BadRequestError_1.default({ code: 404, message: "Necesario escribir correo y contraseña", logging: true });
    }
    const request = pool.request();
    request.input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario);
    request.input('Password', mssql_1.default.VarChar(50), password);
    const result = await request.execute('sp_AuthenticateAndGetMovement');
    const validations = result.recordsets[0];
    if (validations[0].Tipo === "usuario" && validations[0].Resultado !== 1) {
        throw new BadRequestError_1.default({ code: 404, message: "Correo no encontrado", logging: true });
    }
    ;
    if (validations[1].Tipo === "contrasena" && validations[1].Resultado !== 1) {
        throw new BadRequestError_1.default({ code: 404, message: "Contraseña incorrecta", logging: true });
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