"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalCobranzaService = exports.getTotalSellsByClientService = exports.getTotalSellsService = exports.getCobranzaService = exports.getSellByIdService = exports.getSellsByClientService = exports.getSellsService = void 0;
const database_1 = require("../database");
const sells_1 = require("../database/querys/sells");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const getSellsService = async (sessionId, PageNumber, SellsOrderCondition) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getSells;
    const request = await pool.request()
        .input('OrderCondition', SellsOrderCondition)
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);
    const sells = request.recordset;
    return sells;
};
exports.getSellsService = getSellsService;
;
const getSellsByClientService = async ({ sessionId, PageNumber, Id_Cliente, SellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
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
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);
    const sells = request.recordset;
    return sells;
};
exports.getSellsByClientService = getSellsByClientService;
const getSellByIdService = async (sessionId, folio, Serie, Id_Cliente, Id_Almacen, TipoDoc) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
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
    const sell = request.recordset[0];
    return sell;
};
exports.getSellByIdService = getSellByIdService;
;
const getCobranzaService = async ({ sessionId, PageNumber, Id_Cliente, SellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getCobranza;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('OrderCondition', SellsOrderCondition)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);
    const sells = request.recordset;
    return sells;
};
exports.getCobranzaService = getCobranzaService;
const getTotalSellsService = async (sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getTotalSells;
    const request = await pool.request()
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalSellsService = getTotalSellsService;
;
const getTotalSellsByClientService = async ({ sessionId, Id_Cliente, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getTotalSellsByClient;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('FilterExpired', FilterExpired)
        .input('FilterNotExpired', FilterNotExpired)
        .input('DateStart', DateStart)
        .input('DateEnd', DateEnd)
        .input('DateExactly', DateExactly)
        .input('TipoDoc', TipoDoc)
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalSellsByClientService = getTotalSellsByClientService;
const getTotalCobranzaService = async ({ sessionId, Id_Cliente, FilterTipoDoc, TipoDoc }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = sells_1.sellsQuery.getTotalCobranza;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('FilterTipoDoc', FilterTipoDoc)
        .input('TipoDoc', TipoDoc)
        .query(query);
    const sells = request.recordset;
    return sells;
};
exports.getTotalCobranzaService = getTotalCobranzaService;
//# sourceMappingURL=sellsDocsServices.js.map