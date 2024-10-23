"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellsDocService = exports.getSellsDocsService = void 0;
const database_1 = require("../database");
const sells_1 = require("../database/querys/sells");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const getSellsDocsService = async (sessionId, PageNumber, TipoDoc) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getDocFromSells;
    const request = await pool.request()
        .input('TipoDoc', TipoDoc)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getSellsDocsService = getSellsDocsService;
const getSellsDocService = async (sessionId, folio, TipoDoc) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getQuote;
    const request = await pool.request()
        .input('TipoDoc', TipoDoc)
        .input('Folio', folio)
        .query(query);
    const quote = request.recordset[0];
    return quote;
};
exports.getSellsDocService = getSellsDocService;
//# sourceMappingURL=sellsDocsServices.js.map