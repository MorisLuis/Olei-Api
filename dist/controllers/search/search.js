"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodigos = exports.getMarcas = exports.getFamilias = void 0;
const searchServices_1 = require("../../services/searchServices");
const searchValidations_1 = require("../../validations/searchValidations");
const getFamilias = async (req, res, next) => {
    try {
        const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const { familias } = await (0, searchServices_1.searchFamiliaService)({
            sessionId,
            searchTerm
        });
        return res.json({
            familias
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getFamilias = getFamilias;
const getMarcas = async (req, res, next) => {
    try {
        const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const { marcas } = await (0, searchServices_1.searchMarcaService)({
            sessionId,
            searchTerm
        });
        return res.json({
            marcas
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getMarcas = getMarcas;
const getCodigos = async (req, res, next) => {
    try {
        const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const { codigos } = await (0, searchServices_1.searchCodigoService)({
            sessionId,
            searchTerm
        });
        return res.json({
            codigos
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCodigos = getCodigos;
//# sourceMappingURL=search.js.map