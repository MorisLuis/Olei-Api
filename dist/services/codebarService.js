"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCodebarService = void 0;
const database_1 = require("../database");
const identifyBarcodeType_1 = require("../utils/identifyBarcodeType");
const costos_1 = require("../database/querys/costos");
const uuid_1 = require("uuid");
const mssql_1 = __importDefault(require("mssql"));
const CustomError_1 = require("../errors/CustomError");
const updateCodebarService = async (userSession, codigoParam, Id_Marca, body) => {
    const { ServidorSQL, BaseSQL, PasswordSQL, UsuarioSQL } = userSession;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL, UsuarioSQL, PasswordSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
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
        throw new CustomError_1.ValidationError('Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.');
    }
    ;
    const query = costos_1.costosQuerys.updateCostos;
    // Codebar random
    if (codeRandom === "true") {
        const uniqueId = (0, uuid_1.v4)();
        const codeBarRandom = uniqueId.replace(/-/g, '').substring(0, 10);
        CodBar = codeBarRandom;
    }
    const request = new mssql_1.default.Request(transaction);
    request.input('codigo', mssql_1.default.NVarChar, codigoParam);
    request.input('Id_Marca', mssql_1.default.Int, Id_Marca);
    request.input('CodBar', mssql_1.default.NVarChar, CodBar);
    await request.query(query);
    await transaction.commit();
    return {
        codigo: codigoParam,
        CodBar
    };
};
exports.updateCodebarService = updateCodebarService;
//# sourceMappingURL=codebarService.js.map