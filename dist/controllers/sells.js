"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellById = exports.getSellsByClient = exports.getSells = void 0;
const sellsDocsServices_1 = require("../services/sellsDocsServices");
const sells_1 = require("../interface/sells");
const getSells = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition } = req.query;
        const sessionId = req.sessionID;
        let orderCondition;
        if (typeof sellsOrderCondition === 'string' && sells_1.SellsOrderCondition.includes(sellsOrderCondition)) {
            orderCondition = sellsOrderCondition;
        }
        else {
            orderCondition = "";
        }
        const sells = await (0, sellsDocsServices_1.getSellsService)(sessionId, Number(PageNumber), orderCondition);
        res.json(sells);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getSells = getSells;
const getSellById = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const sessionId = req.sessionID;
        const { Serie, Id_Almacen, Id_Cliente, TipoDoc } = req.query;
        const { folio } = req.params;
        const sell = await (0, sellsDocsServices_1.getSellByIdService)(sessionId, folio, Serie, Number(Id_Cliente), Number(Id_Almacen), TipoDoc ? Number(TipoDoc) : 0);
        res.json(sell);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getSellById = getSellById;
const getSellsByClient = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition, sellsFilterCondition, TipoDoc } = req.query;
        const { client } = req.params;
        let orderCondition;
        if (typeof sellsOrderCondition === 'string' && sells_1.SellsOrderCondition.includes(sellsOrderCondition)) {
            orderCondition = sellsOrderCondition;
        }
        else {
            orderCondition = "";
        }
        let filterCondtion;
        if (typeof sellsFilterCondition === 'string' && sells_1.SellsFilterCondition.includes(sellsFilterCondition)) {
            filterCondtion = sellsFilterCondition;
        }
        else {
            filterCondtion = "";
        }
        const sessionId = req.sessionID;
        const sells = await (0, sellsDocsServices_1.getSellsByClientService)({
            sessionId,
            Id_Cliente: Number(client),
            PageNumber: Number(PageNumber),
            SellsOrderCondition: orderCondition,
            SellsFilterCondition: filterCondtion,
            TipoDoc: TipoDoc ? Number(TipoDoc) : 0
        });
        res.json(sells);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getSellsByClient = getSellsByClient;
//# sourceMappingURL=sells.js.map