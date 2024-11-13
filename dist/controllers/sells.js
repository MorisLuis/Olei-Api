"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellById = exports.getSellsByClient = exports.getSells = void 0;
const sellsDocsServices_1 = require("../services/sellsDocsServices");
const getSells = async (req, res, next) => {
    try {
        // Get session from REDIS.
        const { PageNumber, SellsOrderCondition } = req.query;
        const sessionId = req.sessionID;
        const quotes = await (0, sellsDocsServices_1.getSellsService)(sessionId, Number(PageNumber), SellsOrderCondition);
        res.json(quotes);
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
        console.log({ folio });
        const quote = await (0, sellsDocsServices_1.getSellByIdService)(sessionId, folio, Serie, Number(Id_Cliente), Number(Id_Almacen), TipoDoc ? Number(TipoDoc) : 0);
        res.json(quote);
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
        const { PageNumber, SellsOrderCondition, SellsFilterCondition, TipoDoc } = req.query;
        const { client } = req.params;
        console.log({ client });
        const sessionId = req.sessionID;
        const quotes = await (0, sellsDocsServices_1.getSellsByClientService)({
            sessionId,
            Id_Cliente: Number(client),
            PageNumber: Number(PageNumber),
            SellsOrderCondition: SellsOrderCondition,
            SellsFilterCondition: SellsFilterCondition,
            TipoDoc: TipoDoc ? Number(TipoDoc) : 0
        });
        res.json(quotes);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getSellsByClient = getSellsByClient;
//# sourceMappingURL=sells.js.map