"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbonos = void 0;
const abonos_service_1 = require("../../services/abonos/abonos.service");
const abonos_schema_1 = require("./abonos.schema");
const parsePrismaFilter_1 = require("../../utils/prisma/parsePrismaFilter");
const getAbonos = async (req, res, next) => {
    try {
        const { PageNumber, limit, orderField, orderDirection, filterField, filterValue } = abonos_schema_1.getAbonosQuerySchema.parse(req.query);
        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;
        const filters = (0, parsePrismaFilter_1.parsePrismaFilter)(filterField, filterValue);
        const { abonos } = await (0, abonos_service_1.getAbonosService)({
            userSession,
            orderField,
            orderDirection,
            skip,
            limit,
            filters
        });
        return res.json({
            abonos
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getAbonos = getAbonos;
//# sourceMappingURL=abonos.controller.js.map