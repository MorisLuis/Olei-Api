import { NextFunction, Request, Response } from "express"
import { getSellsDocsService, getSellsDocService } from "../services/sellsDocsServices";

const getQuotes = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const { PageNumber } = req.query;
        const sessionId = req.sessionID
        const quotes = await getSellsDocsService(
            sessionId,
            Number(PageNumber),
            4
        )
        res.json(quotes);
    } catch (error) {
        next(error)
    };

};

const getQuote = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const { folio } = req.params;

        const sessionId = req.sessionID
        console.log({sessionId})
        const quote = await getSellsDocService(
            sessionId,
            folio as string,
            4
        );

        res.json(quote);
    } catch (error) {
        next(error)
    };

}

export {
    getQuotes,
    getQuote
}