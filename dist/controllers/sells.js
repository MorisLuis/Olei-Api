"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalCobranza = exports.getTotalSellsByClient = exports.getTotalSells = exports.getCobranza = exports.getSellById = exports.getSellsByClient = exports.getSells = void 0;
const sellsDocsServices_1 = require("../services/sellsDocsServices");
const sellsValidations_1 = require("../validations/sellsValidations");
const zod_1 = require("zod");
const getSells = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition } = sellsValidations_1.getSellsQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        console.log({ sessionId });
        const sells = await (0, sellsDocsServices_1.getSellsService)(sessionId, PageNumber, sellsOrderCondition);
        res.json(sells);
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
exports.getSells = getSells;
const getSellById = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;
        const { Serie, Id_Almacen, Id_Cliente, TipoDoc } = sellsValidations_1.getSellByIdQuerySchema.parse(req.query);
        const { folio } = sellsValidations_1.getSellByIdParamsSchema.parse(req.params);
        const sell = await (0, sellsDocsServices_1.getSellByIdService)(sessionId, folio, Serie, Id_Cliente, Id_Almacen, TipoDoc);
        res.json(sell);
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
exports.getSellById = getSellById;
const getSellsByClient = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = sellsValidations_1.getSellsByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
        const sells = await (0, sellsDocsServices_1.getSellsByClientService)({
            sessionId,
            Id_Cliente: client,
            PageNumber: PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc: TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });
        res.json(sells);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getSellsByClient = getSellsByClient;
const getCobranza = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition, TipoDoc } = sellsValidations_1.getCobranzaQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
        const sells = await (0, sellsDocsServices_1.getCobranzaService)({
            sessionId,
            Id_Cliente: client,
            PageNumber: PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc: 0
        });
        res.json(sells);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getCobranza = getCobranza;
const getTotalSells = async (req, res, next) => {
    try {
        const sessionId = req.sessionRedis;
        const total = await (0, sellsDocsServices_1.getTotalSellsService)(sessionId);
        res.json(total);
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalSells = getTotalSells;
const getTotalSellsByClient = async (req, res, next) => {
    try {
        const params = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const { FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart, } = sellsValidations_1.getTotalSellsByClientQuerySchema.parse(req.query);
        console.log({
            FilterTipoDoc,
            FilterExpired,
            FilterNotExpired,
            TipoDoc,
            DateEnd,
            DateExactly,
            DateStart,
        });
        const total = await (0, sellsDocsServices_1.getTotalSellsByClientService)({
            sessionId: req.sessionRedis,
            Id_Cliente: params.client,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });
        res.json(total);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getTotalSellsByClient = getTotalSellsByClient;
const getTotalCobranza = async (req, res, next) => {
    try {
        const { FilterTipoDoc, TipoDoc } = sellsValidations_1.getTotalSellsByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const sessionId = req.sessionRedis;
        const total = await (0, sellsDocsServices_1.getTotalCobranzaService)({ sessionId, FilterTipoDoc, TipoDoc, Id_Cliente: client });
        res.json(total);
    }
    catch (error) {
        next(error);
    }
};
exports.getTotalCobranza = getTotalCobranza;
//# sourceMappingURL=sells.js.map