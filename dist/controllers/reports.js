"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExcellCobranza = void 0;
const sellsValidations_1 = require("../validations/sellsValidations");
const resportsService_1 = require("../services/resportsService");
const zod_1 = require("zod");
const getExcellCobranza = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = sellsValidations_1.getCobranzaQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
        await (0, resportsService_1.reportsCobranzaService)({
            sessionId,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            res: res
        });
        res.json({ ok: true });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
    ;
};
exports.getExcellCobranza = getExcellCobranza;
//# sourceMappingURL=reports.js.map