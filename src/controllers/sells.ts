import { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService } from "../services/sellsDocsServices";
import { SellsFilterCondition, SellsFilterConditionType, SellsInterface, SellsOrderCondition, SellsOrderConditionType } from "../interface/sells";

const getSells = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition } = req.query;
        const sessionId = req.sessionID

        let orderCondition: SellsOrderConditionType | string;

        if (typeof sellsOrderCondition === 'string' && SellsOrderCondition.includes(sellsOrderCondition as SellsOrderConditionType)) {
            orderCondition = sellsOrderCondition;
        } else {
            orderCondition = ""
        }

        const sells = await getSellsService(
            sessionId,
            Number(PageNumber),
            orderCondition
        )
        res.json(sells);

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

        const sell = await getSellByIdService(
            sessionId,
            folio,
            Serie as string,
            Number(Id_Cliente),
            Number(Id_Almacen),
            TipoDoc ? Number(TipoDoc) as SellsInterface['TipoDoc'] : 0
        );

        res.json(sell);
    } catch (error) {
        next(error)
    };

};

const getSellsByClient = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition, sellsFilterCondition, TipoDoc } = req.query;
        const { client } = req.params;

        let orderCondition: SellsOrderConditionType | string;
        if (typeof sellsOrderCondition === 'string' && SellsOrderCondition.includes(sellsOrderCondition as SellsOrderConditionType)) {
            orderCondition = sellsOrderCondition;
        } else {
            orderCondition = ""
        }

        let filterCondtion: SellsFilterConditionType | string;
        if (typeof sellsFilterCondition === 'string' && SellsFilterCondition.includes(sellsFilterCondition as SellsFilterConditionType)) {
            filterCondtion = sellsFilterCondition;
        } else {
            filterCondtion = ""
        }

        const sessionId = req.sessionID
        const sells = await getSellsByClientService({
            sessionId,
            Id_Cliente: Number(client),
            PageNumber: Number(PageNumber),
            SellsOrderCondition: orderCondition,
            SellsFilterCondition: filterCondtion,
            TipoDoc: TipoDoc ? Number(TipoDoc) as SellsInterface['TipoDoc'] : 0
        })
        res.json(sells);
    } catch (error) {
        next(error)
    };

};

export {
    getSells,
    getSellsByClient,
    getSellById
}