"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellById = exports.getSellsByClientCountAndTotal = exports.getSellsByClient = exports.getSellsCountAndTotal = exports.getSells = void 0;
const sellsDocsServices_1 = require("../../services/sells/sellsDocsServices");
const sellsValidations_1 = require("../../validations/sellsValidations");
const getSells = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition, searchTerm } = sellsValidations_1.getSellsQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { sells } = await (0, sellsDocsServices_1.getSellsService)({
            userSession,
            PageNumber,
            sellsOrderCondition,
            searchTerm
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
exports.getSells = getSells;
const getSellsCountAndTotal = async (req, res, next) => {
    try {
        const { searchTerm } = sellsValidations_1.getSellsCountAndTotalQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { count, total } = await (0, sellsDocsServices_1.getSellsCountAndTotalService)({
            userSession,
            searchTerm
        });
        return res.json({
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getSellsCountAndTotal = getSellsCountAndTotal;
const getSellsByClient = async (req, res, next) => {
    try {
        const { PageNumber, sellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = sellsValidations_1.getSellsByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { sells } = await (0, sellsDocsServices_1.getSellsByClientService)({
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
            sells
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getSellsByClient = getSellsByClient;
const getSellsByClientCountAndTotal = async (req, res, next) => {
    try {
        const { FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = sellsValidations_1.getSellsByClientCountAndTotalQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { count, total } = await (0, sellsDocsServices_1.getSellsByClientCountAndTotalService)({
            userSession,
            Id_Cliente: client,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });
        return res.json({
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getSellsByClientCountAndTotal = getSellsByClientCountAndTotal;
const getSellById = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;
        const { Serie, Id_Almacen, TipoDoc } = sellsValidations_1.getSellByIdQuerySchema.parse(req.query);
        const { folio } = sellsValidations_1.getFolioParamsSchema.parse(req.params);
        const sell = await (0, sellsDocsServices_1.getSellByIdService)(userSession, folio, Serie, Id_Almacen, TipoDoc);
        return res.json({
            sell
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getSellById = getSellById;
//# sourceMappingURL=sells.js.map