"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCodigoService = exports.searchMarcaService = exports.searchFamiliaService = void 0;
const database_1 = require("../database");
const CustomError_1 = require("../errors/CustomError");
const getSession_1 = require("../utils/Redis/getSession");
const searchFamiliaService = async ({ sessionId, searchTerm }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
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
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(database_1.querys.getMarcas);
    const marcas = result?.recordset;
    return {
        marcas
    };
};
exports.searchMarcaService = searchMarcaService;
const searchCodigoService = async ({ sessionId, searchTerm }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    const result = await pool.request()
        .input('Codigo', searchTerm)
        .query(database_1.querys.getFolios);
    const codigos = result?.recordset;
    return {
        codigos
    };
};
exports.searchCodigoService = searchCodigoService;
//# sourceMappingURL=searchServices.js.map