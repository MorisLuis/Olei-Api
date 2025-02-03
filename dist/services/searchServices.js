"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAlmacenesService = exports.searcCodigoService = exports.searchMarcaService = exports.searchFamiliaService = void 0;
const database_1 = require("../database");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const searchFamiliaService = async ({ sessionId, searchTerm }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(database_1.querys.getFamilias);
    const familias = result?.recordset;
    return {
        familias
    };
};
exports.searchFamiliaService = searchFamiliaService;
const searchMarcaService = async ({ sessionId, searchTerm }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(database_1.querys.getMarcas);
    const marcas = result?.recordset;
    return {
        marcas
    };
};
exports.searchMarcaService = searchMarcaService;
const searcCodigoService = async ({ sessionId, searchTerm }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    const result = await pool.request()
        .input('Codigo', searchTerm)
        .query(database_1.querys.getFolios);
    const codigos = result?.recordset;
    return {
        codigos
    };
};
exports.searcCodigoService = searcCodigoService;
const searchAlmacenesService = async ({ sessionId, nombre }) => {
    const { user: userFR } = await (0, getSession_1.handleGetSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { ServidorSQL, BaseSQL } = userFR;
    const pool = await (0, database_1.dbConnection)(ServidorSQL, BaseSQL);
    const result = await pool.request()
        .input('Nombre', nombre)
        .query(database_1.querys.getAlmacenes);
    const almacenes = result?.recordset;
    return {
        almacenes
    };
};
exports.searchAlmacenesService = searchAlmacenesService;
//# sourceMappingURL=searchServices.js.map