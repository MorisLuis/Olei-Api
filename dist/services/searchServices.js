"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCodigoService = exports.searchMarcaService = exports.searchFamiliaService = void 0;
const database_1 = require("../database");
const searchFamiliaService = async ({ userSession, searchTerm }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(database_1.querys.getFamilias);
    const familias = result?.recordset;
    return {
        familias
    };
};
exports.searchFamiliaService = searchFamiliaService;
const searchMarcaService = async ({ userSession, searchTerm }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    const result = await pool.request()
        .input('Nombre', searchTerm)
        .query(database_1.querys.getMarcas);
    const marcas = result?.recordset;
    return {
        marcas
    };
};
exports.searchMarcaService = searchMarcaService;
const searchCodigoService = async ({ userSession, searchTerm }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
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