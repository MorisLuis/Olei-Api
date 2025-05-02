"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCobranzaWithTotals = exports.getCobranza = exports.getCobranzaByClient = exports.getSellById = exports.getSellsByClient = exports.getSells = void 0;
const sellsDocsServices_1 = require("../services/sells/sellsDocsServices");
const sellsValidations_1 = require("../validations/sellsValidations");
const zod_1 = require("zod");
const cobranzaService_1 = require("../services/cobranza/cobranzaService");
const getSells = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition, searchTerm } = sellsValidations_1.getSellsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { sells, count, total } = await (0, sellsDocsServices_1.getSellsService)(userSession, PageNumber, sellsOrderCondition, searchTerm);
        return res.json({
            sells,
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getSells = getSells;
const getSellById = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;
        const { Serie, Id_Almacen, TipoDoc } = sellsValidations_1.getSellByIdQuerySchema.parse(req.query);
        const { folio } = sellsValidations_1.getSellByIdParamsSchema.parse(req.params);
        const sell = await (0, sellsDocsServices_1.getSellByIdService)(userSession, folio, Serie, Id_Almacen, TipoDoc);
        return res.json({
            sell
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            return next(error);
        }
    }
    ;
};
exports.getSellById = getSellById;
const getSellsByClient = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = sellsValidations_1.getSellsByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { sells, count, total } = await (0, sellsDocsServices_1.getSellsByClientService)({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });
        return res.json({
            sells,
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getSellsByClient = getSellsByClient;
/* Cobranza */
const getCobranza = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, cobranzaOrderCondition, termSearch } = sellsValidations_1.getCobranzaQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { cobranza, count, total } = await (0, cobranzaService_1.getCobranzaService)({
            userSession,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            termSearch
        });
        return res.json({
            cobranza,
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCobranza = getCobranza;
const getCobranzaByClient = async (req, res, next) => {
    try {
        const { PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = sellsValidations_1.getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { cobranza, total, count } = await (0, cobranzaService_1.getCobranzaByClientService)({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });
        return res.json({
            cobranza,
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCobranzaByClient = getCobranzaByClient;
const getCobranzaWithTotals = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = sellsValidations_1.getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { brief } = await (0, cobranzaService_1.getCobranzaWithTotalsService)({
            userSession,
            Id_Cliente: client,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });
        return res.json({
            brief
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCobranzaWithTotals = getCobranzaWithTotals;
//# sourceMappingURL=sells.js.map