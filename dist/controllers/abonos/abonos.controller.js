"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbonoDetails = exports.getAbonoById = exports.getAbonos = void 0;
const abonos_service_1 = require("../../services/abonos/abonos.service");
const abonos_schema_1 = require("./abonos.schema");
const parsePrismaFilter_1 = require("../../utils/prisma/parsePrismaFilter");
const getAbonos = async (req, res, next) => {
    try {
        const { PageNumber, limit, orderField, orderDirection, filterField, filterValue, startDate, endDate, exactlyDate } = abonos_schema_1.getAbonosQuerySchema.parse(req.query);
        const skip = (PageNumber - 1) * limit;
        const userSession = req.sessionWeb;
        const filters = (0, parsePrismaFilter_1.parsePrismaFilter)(filterField, filterValue);
        const { abonos, total } = await (0, abonos_service_1.getAbonosService)({
            userSession,
            orderField,
            orderDirection,
            skip,
            limit,
            filters,
            startDate,
            endDate,
            exactlyDate
        });
        return res.json({
            abonos,
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getAbonos = getAbonos;
const getAbonoById = async (req, res, next) => {
    try {
        const { folio: Folio } = abonos_schema_1.getAbonoByIdParamsSchema.parse(req.params);
        const { Id_Almacen } = abonos_schema_1.getAbonoByIdQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const abono = await (0, abonos_service_1.getAbonoByIdService)({
            userSession,
            Id_Almacen,
            Folio
        });
        return res.json(abono);
    }
    catch (error) {
        return next(error);
    }
};
exports.getAbonoById = getAbonoById;
const getAbonoDetails = async (req, res, next) => {
    try {
        const { folio } = req.params;
        const { PageNumber } = req.query;
        const { abonoDetails } = await (0, abonos_service_1.getAbonoDetailsService)({
            userSession: req.sessionWeb,
            PageNumber: Number(PageNumber) || 1,
            folio
        });
        return res.json({ abonoDetails });
    }
    catch (error) {
        return next(error);
    }
};
exports.getAbonoDetails = getAbonoDetails;
//# sourceMappingURL=abonos.controller.js.map