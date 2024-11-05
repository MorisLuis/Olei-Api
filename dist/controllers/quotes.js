"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuote = exports.getQuotes = void 0;
const sellsDocsServices_1 = require("../services/sellsDocsServices");
const getQuotes = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber } = req.query;
        const sessionId = req.sessionID;
        const quotes = await (0, sellsDocsServices_1.getSellsDocsService)(sessionId, Number(PageNumber), 4);
        res.json(quotes);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getQuotes = getQuotes;
const getQuote = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { folio } = req.params;
        const sessionId = req.sessionID;
        console.log({ sessionId });
        const quote = await (0, sellsDocsServices_1.getSellsDocService)(sessionId, folio, 4);
        res.json(quote);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getQuote = getQuote;
//# sourceMappingURL=quotes.js.map