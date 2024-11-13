"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemission = exports.getRemissions = void 0;
const getRemissions = async (req, res, next) => {
    /* try {
        // Get session from REDIS.
        const { PageNumber } = req.query;
        const sessionId = req.sessionID
        const quotes = await getSellsDocsService(
            sessionId,
            Number(PageNumber),
            2
        )
        res.json(quotes);
    } catch (error) {
        next(error)
    }; */
};
exports.getRemissions = getRemissions;
const getRemission = async (req, res, next) => {
    /*  try {
         // Get session from REDIS.
         const { folio } = req.params;
 
         const sessionId = req.sessionID
         const quote = await getSellsDocService(
             sessionId,
             folio as string,
             2
         );
 
         res.json(quote);
     } catch (error) {
         next(error)
     }; */
};
exports.getRemission = getRemission;
//# sourceMappingURL=remissions.js.map