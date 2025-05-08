"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCobranzaWithTotals = exports.getCobranzaByClientCountAndTotal = exports.getCobranzaByClient = exports.getCobranzaCountAndTotal = exports.getCobranza = void 0;
const sellsValidations_1 = require("../../validations/sellsValidations");
const cobranzaService_1 = require("../../services/cobranza/cobranzaService");
const cobranzaValidations_1 = require("../../validations/cobranzaValidations");
/* Cobranza */
const getCobranza = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, cobranzaOrderCondition, termSearch } = cobranzaValidations_1.getCobranzaQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { cobranza } = await (0, cobranzaService_1.getCobranzaService)({
            userSession,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            termSearch
        });
        return res.json({
            cobranza
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCobranza = getCobranza;
const getCobranzaCountAndTotal = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { termSearch } = cobranzaValidations_1.getCobranzaQueryCountAndTotalSchema.parse(req.query);
        const userSession = req.sessionWeb;
        const { count, total } = await (0, cobranzaService_1.getCobranzaCountAndTotalService)({
            userSession,
            termSearch
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
exports.getCobranzaCountAndTotal = getCobranzaCountAndTotal;
const getCobranzaByClient = async (req, res, next) => {
    try {
        const { Id_Almacen, PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = cobranzaValidations_1.getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { cobranza } = await (0, cobranzaService_1.getCobranzaByClientService)({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Id_Almacen
        });
        return res.json({
            cobranza
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCobranzaByClient = getCobranzaByClient;
const getCobranzaByClientCountAndTotal = async (req, res, next) => {
    try {
        const { Id_Almacen, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = cobranzaValidations_1.getCobranzaByClientCountAndTotalQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { count, total } = await (0, cobranzaService_1.getCobranzaByClientCountAndTotalService)({
            userSession,
            Id_Cliente: client,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Id_Almacen
        });
        return res.json({
            count,
            total
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCobranzaByClientCountAndTotal = getCobranzaByClientCountAndTotal;
const getCobranzaWithTotals = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { Id_Almacen, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = cobranzaValidations_1.getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = sellsValidations_1.getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;
        const { SaldoVencido, SaldoNoVencido, TotalSaldo } = await (0, cobranzaService_1.getCobranzaWithTotalsService)({
            userSession,
            Id_Cliente: client,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Id_Almacen
        });
        return res.json({
            SaldoVencido, SaldoNoVencido, TotalSaldo
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCobranzaWithTotals = getCobranzaWithTotals;
//# sourceMappingURL=cobranza.js.map