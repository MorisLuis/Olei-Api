"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodigos = exports.getMarcas = exports.getFamilias = void 0;
const searchServices_1 = require("../../services/searchServices");
const searchValidations_1 = require("../../validations/searchValidations");
const getFamilias = async (req, res, next) => {
    const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionRedis;
    const { familias } = await (0, searchServices_1.searchFamiliaService)({
        sessionId,
        searchTerm
    });
    res.json({
        familias
    });
};
exports.getFamilias = getFamilias;
const getMarcas = async (req, res, next) => {
    const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionRedis;
    const { marcas } = await (0, searchServices_1.searchMarcaService)({
        sessionId,
        searchTerm
    });
    res.json({
        marcas
    });
};
exports.getMarcas = getMarcas;
const getCodigos = async (req, res, next) => {
    const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
    const sessionId = req.sessionRedis;
    const { codigos } = await (0, searchServices_1.searchCodigoService)({
        sessionId,
        searchTerm
    });
    res.json({
        codigos
    });
};
exports.getCodigos = getCodigos;
//# sourceMappingURL=search.js.map