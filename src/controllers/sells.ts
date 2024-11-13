import { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService } from "../services/sellsDocsServices";
import { SellsFilterCondition, SellsInterface, SellsOrderCondition } from "../interface/sells";

const getSells = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const { PageNumber, SellsOrderCondition } = req.query;
        const sessionId = req.sessionID
        const quotes = await getSellsService(
            sessionId,
            Number(PageNumber),
            SellsOrderCondition as SellsOrderCondition
        )
        res.json(quotes);
    } catch (error) {
        next(error)
    };

};

const getSellById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionID
        const { Serie, Id_Almacen, Id_Cliente, TipoDoc } = req.query;
        const { folio } = req.params;

        console.log({folio})
        const quote = await getSellByIdService(sessionId, folio, Serie as string, Number(Id_Cliente), Number(Id_Almacen), TipoDoc ? Number(TipoDoc) as SellsInterface['TipoDoc'] : 0 );
        res.json(quote);
    } catch (error) {
        next(error)
    };

};

const getSellsByClient = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const { PageNumber, SellsOrderCondition, SellsFilterCondition, TipoDoc } = req.query;
        const { client } = req.params;

        console.log({ client })

        const sessionId = req.sessionID
        const quotes = await getSellsByClientService({
            sessionId,
            Id_Cliente: Number(client),
            PageNumber: Number(PageNumber),
            SellsOrderCondition: SellsOrderCondition as SellsOrderCondition,
            SellsFilterCondition: SellsFilterCondition as SellsFilterCondition,
            TipoDoc: TipoDoc ? Number(TipoDoc) as SellsInterface['TipoDoc'] : 0
        })
        res.json(quotes);
    } catch (error) {
        next(error)
    };

};

export {
    getSells,
    getSellsByClient,
    getSellById
}