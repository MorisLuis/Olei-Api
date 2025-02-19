"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCostos = void 0;
const codebarService_1 = require("../services/codebarService");
const costosValidations_1 = require("../validations/costosValidations");
const updateCostos = async (req, res, next) => {
    const sessionId = req.sessionID;
    const { codigo: codigoParam, Id_Marca } = costosValidations_1.updateCodbarQuerySchema.parse(req.query);
    const body = req.body;
    console.log({ body });
    try {
        const resp = await (0, codebarService_1.updateCodebarService)(sessionId, codigoParam, Id_Marca, body);
        res.json({
            resp
        });
    }
    catch (error) {
        console.log({ error });
        next(error);
    }
    ;
};
exports.updateCostos = updateCostos;
//# sourceMappingURL=costos.js.map