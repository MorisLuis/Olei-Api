"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorsService = void 0;
const moment_1 = __importDefault(require("moment"));
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const CustomError_1 = require("../errors/CustomError");
const errorsService = async (data) => {
    const pool = await (0, database_1.dbConnectionMain)();
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    try {
        const request = new mssql_1.default.Request(transaction);
        const fechaActualCDMX = (0, moment_1.default)().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');
        await request
            .input('From', mssql_1.default.VarChar, data.From || '')
            .input('Message', mssql_1.default.VarChar, data.Message || '')
            .input('Id_Usuario', mssql_1.default.VarChar, data.Id_Usuario || '')
            .input('Fecha', mssql_1.default.VarChar, fechaActualCDMX)
            .input('Metodo', mssql_1.default.VarChar, data.Metodo || '')
            .input('code', mssql_1.default.Int, data.code || '')
            .query(database_1.querys.postError);
        await transaction.commit();
    }
    catch (err) {
        await transaction.rollback();
        throw err;
    }
};
exports.errorsService = errorsService;
//# sourceMappingURL=errorService.js.map