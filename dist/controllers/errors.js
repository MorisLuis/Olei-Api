"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrorsEndpoint = exports.handleErrors = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const moment_1 = __importDefault(require("moment"));
const CustomError_1 = require("../errors/CustomError");
const handleErrors = async (req, res) => {
    try {
        const pool = await (0, database_1.dbConnectionMain)();
        const { From, Message, Id_Usuario, Metodo, code } = req.body;
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        let query = database_1.querys.postError;
        const fechaActualCDMX = (0, moment_1.default)().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');
        const resp = await request
            .input('From', mssql_1.default.VarChar, From || '')
            .input('Message', mssql_1.default.VarChar, Message || '')
            .input('Id_Usuario', mssql_1.default.VarChar, Id_Usuario || '')
            .input('Fecha', mssql_1.default.VarChar, fechaActualCDMX)
            .input('Metodo', mssql_1.default.VarChar, Metodo || '')
            .input('code', mssql_1.default.Int, code || '')
            .query(query);
        await transaction.commit();
        return res.json({
            ok: true
        });
    }
    catch (error) {
        return res.status(500).send(error);
    }
};
exports.handleErrors = handleErrors;
;
const handleErrorsEndpoint = async ({ From, Message, Id_Usuario, Metodo, code }) => {
    try {
        const pool = await (0, database_1.dbConnectionMain)();
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        const request = new mssql_1.default.Request(transaction);
        let query = database_1.querys.postError;
        const fechaActualCDMX = (0, moment_1.default)().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss.SSS');
        await request
            .input('From', mssql_1.default.VarChar, From || '')
            .input('Message', mssql_1.default.VarChar, Message || '')
            .input('Id_Usuario', mssql_1.default.VarChar, Id_Usuario || '')
            .input('Fecha', mssql_1.default.VarChar, fechaActualCDMX)
            .input('Metodo', mssql_1.default.VarChar, Metodo || '')
            .input('code', mssql_1.default.VarChar, code || '')
            .query(query);
        await transaction.commit();
    }
    catch (error) {
        throw new CustomError_1.NotFoundError(`Error al conectarse a base de datos principal: ${error}`);
    }
};
exports.handleErrorsEndpoint = handleErrorsEndpoint;
//# sourceMappingURL=errors.js.map