"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCostos = void 0;
const codebarService_1 = require("../services/codebarService");
const costosValidations_1 = require("../validations/costosValidations");
const updateCostos = async (req, res, next) => {
    const userSession = req.session;
    const { codigo: codigoParam, Id_Marca } = costosValidations_1.updateCodbarQuerySchema.parse(req.query);
    const body = req.body;
    try {
        const { CodBar, codigo } = await (0, codebarService_1.updateCodebarService)(userSession, codigoParam, Id_Marca, body);
        return res.json({
            CodBar, codigo
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.updateCostos = updateCostos;
//# sourceMappingURL=costos.js.map