"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellByIdService = exports.getSellsByClientService = exports.getSellsService = void 0;
const database_1 = require("../database");
const sells_1 = require("../database/querys/sells");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const getSellsService = async (sessionId, PageNumber, SellsOrderCondition) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getSells;
    console.log({ PageNumber });
    const request = await pool.request()
        .input('OrderCondition', SellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getSellsService = getSellsService;
const getSellsByClientService = async ({ sessionId, PageNumber, Id_Cliente, SellsOrderCondition, SellsFilterCondition, TipoDoc }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getSellsByClient;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition ?? '')
        .input('WhereCondition', SellsFilterCondition ?? '')
        .input('TipoDoc', TipoDoc)
        .query(query);
    const quote = request.recordset;
    return quote;
};
exports.getSellsByClientService = getSellsByClientService;
const getSellByIdService = async (sessionId, folio, Serie, Id_Cliente, Id_Almacen, TipoDoc) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getSellById;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .input('Serie', Serie)
        .input('Folio', folio)
        .input('TipoDoc', TipoDoc)
        .query(query);
    const quote = request.recordset;
    return quote;
};
exports.getSellByIdService = getSellByIdService;
//# sourceMappingURL=sellsDocsServices.js.map