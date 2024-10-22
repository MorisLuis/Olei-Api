"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCostos = void 0;
const database_1 = require("../database");
const mssql_1 = __importDefault(require("mssql"));
const costos_1 = require("../database/querys/costos");
const uuid_1 = require("uuid");
const identifyBarcodeType_1 = require("../utils/identifyBarcodeType");
const getSession_1 = require("../utils/Redis/getSession");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const updateCostos = async (req, res, next) => {
    const sessionId = req.sessionRedis;
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { serverclientes, baseclientes, PasswordSQL, UsuarioSQL } = userFR;
    try {
        const pool = await (0, database_1.dbConnection)(serverclientes, baseclientes, UsuarioSQL, PasswordSQL);
        const transaction = new mssql_1.default.Transaction(pool);
        await transaction.begin();
        if (!pool) {
            throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
        }
        try {
            const { codigo: codigoParam, Id_Marca } = req.query;
            const body = req.body;
            let isEAN13 = false;
            if (body.CodBar) {
                isEAN13 = (0, identifyBarcodeType_1.verifyIfIsEAN13)(body.CodBar);
            }
            if (isEAN13) {
                body.CodBar = body.CodBar?.substring(1);
            }
            if (!codigoParam || !Id_Marca) {
                await transaction.rollback();
                throw new BadRequestError_1.default({ code: 400, message: `Se requieren los parámetros "codigo" e "Id_Marca" en la consulta.`, logging: true });
            }
            const request = new mssql_1.default.Request(transaction);
            request.input('codigo', mssql_1.default.NVarChar, codigoParam);
            request.input('Id_Marca', mssql_1.default.Int, Id_Marca);
            const keys = Object.keys(body);
            const query = costos_1.costosQuerys.updateCostos;
            // Codebar random
            if (body.codeRandom === "true") {
                const uniqueId = (0, uuid_1.v4)();
                const codeBarRandom = uniqueId.replace(/-/g, '').substring(0, 10);
                body.CodBar = codeBarRandom;
            }
            // Make forEach to create de SET of the query.
            keys.forEach((key) => {
                if (key === 'codeRandom') {
                    request.input('CodBar', mssql_1.default.NVarChar, body['CodBar']);
                }
                else {
                    request.input(key, mssql_1.default.NVarChar, body[key]);
                }
            });
            await request.query(query);
            await transaction.commit();
            res.json({ ok: true });
        }
        catch (error) {
            await transaction.rollback();
            res.status(500).json({ error: 'Hubo un error en la actualización de costos.' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.updateCostos = updateCostos;
//# sourceMappingURL=costos.js.map