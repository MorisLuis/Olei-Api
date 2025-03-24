"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodigos = exports.getMarcas = exports.getFamilias = void 0;
const searchServices_1 = require("../../services/searchServices");
const searchValidations_1 = require("../../validations/searchValidations");
const getFamilias = async (req, res, next) => {
    try {
        const { searchTerm } = searchValidations_1.simpleSearchQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { familias } = await (0, searchServices_1.searchFamiliaService)({
            userSession,
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
        const userSession = req.sessionWeb;
        const { marcas } = await (0, searchServices_1.searchMarcaService)({
            userSession,
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
        const userSession = req.sessionWeb;
        const { codigos } = await (0, searchServices_1.searchCodigoService)({
            userSession,
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