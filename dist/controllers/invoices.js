"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoice = exports.getInvoices = void 0;
const sellsDocsServices_1 = require("../services/sellsDocsServices");
const getInvoices = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber } = req.query;
        const sessionId = req.sessionID;
        const quotes = await (0, sellsDocsServices_1.getSellsDocsService)(sessionId, Number(PageNumber), 1);
        res.json(quotes);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getInvoices = getInvoices;
const getInvoice = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { folio } = req.params;
        const sessionId = req.sessionID;
        const quote = await (0, sellsDocsServices_1.getSellsDocService)(sessionId, folio, 1);
        res.json(quote);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getInvoice = getInvoice;
//# sourceMappingURL=invoices.js.map