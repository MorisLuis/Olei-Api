"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCobranzaWithTotals = exports.getTotalCobranza = exports.getCobranza = exports.getTotalSellsByClient = exports.getTotalSells = exports.getSellById = exports.getSellsByClient = exports.getSells = void 0;
const sellsDocsServices_1 = require("../services/sellsDocsServices");
const sellsValidations_1 = require("../validations/sellsValidations");
const zod_1 = require("zod");
const cobranzaService_1 = require("../services/cobranzaService");
const getSells = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition } = sellsValidations_1.getSellsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const sells = await (0, sellsDocsServices_1.getSellsService)(userSession, PageNumber, sellsOrderCondition);
        return res.json({
            sells
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
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = sellsValidations_1.getSellsByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const sells = await (0, sellsDocsServices_1.getSellsByClientService)({
            userSession,
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
        });
        return res.json({
            sells
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
};
exports.getSellsByClient = getSellsByClient;
const getTotalSells = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const total = await (0, sellsDocsServices_1.getTotalSellsService)(userSession);
        return res.json({ total });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalSells = getTotalSells;
const getTotalSellsByClient = async (req, res, next) => {
    try {
        const params = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const { FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, } = sellsValidations_1.getTotalSellsByClientQuerySchema.parse(req.query);
        const total = await (0, sellsDocsServices_1.getTotalSellsByClientService)({
            userSession: req.sessionWeb,
            Id_Cliente: params.client,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });
        return res.json({
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getTotalSellsByClient = getTotalSellsByClient;
/* Cobranza */
const getCobranza = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = sellsValidations_1.getCobranzaQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const sells = await (0, cobranzaService_1.getAllCobranzaService)({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });
        return res.json({
            sells
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCobranza = getCobranza;
const getTotalCobranza = async (req, res, next) => {
    try {
        const { FilterTipoDoc, TipoDoc, FilterNotExpired, FilterExpired, DateEnd, DateExactly, DateStart } = sellsValidations_1.getTotalCobranzaQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const total = await (0, cobranzaService_1.getTotalCobranzaService)({
            Id_Cliente: client,
            userSession,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });
        return res.json({ total });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            return next(error);
        }
    }
};
exports.getTotalCobranza = getTotalCobranza;
const getCobranzaWithTotals = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = sellsValidations_1.getCobranzaQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { brief } = await (0, cobranzaService_1.getCobranzaWithTotalsService)({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc,
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