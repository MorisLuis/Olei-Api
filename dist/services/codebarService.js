"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCodebarService = void 0;
const database_1 = require("../database");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const identifyBarcodeType_1 = require("../utils/identifyBarcodeType");
const costos_1 = require("../database/querys/costos");
const uuid_1 = require("uuid");
const mssql_1 = __importDefault(require("mssql"));
const updateCodebarService = async (sessionId, codigoParam, Id_Marca, body) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    let { CodBar, codeRandom } = body;
    let isEAN13 = false;
    if (CodBar) {
        isEAN13 = (0, identifyBarcodeType_1.verifyIfIsEAN13)(body.CodBar);
    }
    ;
    if (isEAN13) {
        CodBar = CodBar?.substring(1);
    }
    ;
    if (!codigoParam || !Id_Marca) {
        await transaction.rollback();
        throw new BadRequestError_1.default({ code: 400, message: `Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.`, logging: true });
    }
    ;
    const request = new mssql_1.default.Request(transaction);
    request.input('codigo', mssql_1.default.NVarChar, codigoParam);
    request.input('Id_Marca', mssql_1.default.Int, Id_Marca);
    const keys = Object.keys(body);
    const query = costos_1.costosQuerys.updateCostos;
    // Codebar random
    if (codeRandom === "true") {
        const uniqueId = (0, uuid_1.v4)();
        const codeBarRandom = uniqueId.replace(/-/g, '').substring(0, 10);
        CodBar = codeBarRandom;
    }
    // Make forEach to create de SET of the query.
    keys.forEach((key) => {
        if (key === 'codeRandom') {
            request.input('CodBar', mssql_1.default.NVarChar, body['CodBar']);
        }
    });
    await request.query(query);
    await transaction.commit();
    return { ok: true };
};
exports.updateCodebarService = updateCodebarService;
//# sourceMappingURL=codebarService.js.map