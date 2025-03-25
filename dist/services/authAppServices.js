"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAppService = exports.loginDBAppService = void 0;
const database_1 = require("../database");
const CustomError_1 = require("../errors/CustomError");
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
        throw new CustomError_1.NotFoundError(`Contraseña incorrecta ${IdUsuarioOLEI}`);
    }
    return {
        result
    };
};
exports.loginDBAppService = loginDBAppService;
;
const loginAppService = async ({ session, Id_Usuario, password }) => {
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = session;
    // Conectar a la base de datos
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    // Validar los parámetros de entrada
    if (Id_Usuario.trim() === "" || password.trim() === "") {
        throw new CustomError_1.ValidationError('Necesario escribir correo y contraseña');
    }
    // Ejecutar el 'stores procedure'
    const result = await pool.request()
        .input('Id_Usuario', mssql_1.default.VarChar(50), Id_Usuario)
        .input('Password', mssql_1.default.VarChar(50), password)
        .execute('sp_AuthenticateAndGetMovement');
    // Validar si recordsets es un arreglo o un objeto
    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : Object.values(result.recordsets);
    // Verificar si el primer recordset tiene datos de validación
    const validations = recordsets[0];
    if (validations[0].Tipo === "usuario" && validations[0].Resultado !== 1) {
        throw new CustomError_1.NotFoundError('Correo no encontrado');
    }
    if (validations[1].Tipo === "contrasena" && validations[1].Resultado !== 1) {
        throw new CustomError_1.NotFoundError('Contraseña incorrecta');
    }
    // Extraer datos del usuario
    const userData = recordsets[1];
    return {
        userData: {
            ...userData[0]
        }
    };
};
exports.loginAppService = loginAppService;
//# sourceMappingURL=authAppServices.js.map