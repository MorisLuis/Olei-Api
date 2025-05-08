import type { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService, getSellsCountAndTotalService, getSellsByClientCountAndTotalService } from "../../services/sells/sellsDocsServices";
import { getClientParamsSchema, getSellsQuerySchema, getSellByIdQuerySchema, getFolioParamsSchema, getSellsByClientQuerySchema, getSellsCountAndTotalQuerySchema, getSellsByClientCountAndTotalQuerySchema } from '../../validations/sellsValidations'

const getSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, sellsOrderCondition, searchTerm } = getSellsQuerySchema.parse(req.query)
        const userSession = req.sessionWeb;

        const { sells } = await getSellsService({
            userSession,
            PageNumber,
            sellsOrderCondition,
            searchTerm
        });

        return res.json({
            sells
        });

    } catch (error) {
        return next(error);
    };

};

const getSellsCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { searchTerm } = getSellsCountAndTotalQuerySchema.parse(req.query)
        const userSession = req.sessionWeb;

        const { count, total } = await getSellsCountAndTotalService({
            userSession,
            searchTerm
        });

        return res.json({
            count, 
            total
        });

    } catch (error) {
        return next(error);
    }
}

const getSellsByClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { PageNumber, sellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = getSellsByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);

        const userSession = req.sessionWeb;
        const { sells } = await getSellsByClientService({
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
    } catch (error) {
        return next(error);
    }
};

const getSellsByClientCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {

        const { FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = getSellsByClientCountAndTotalQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);

        const userSession = req.sessionWeb;
        const { count, total } = await getSellsByClientCountAndTotalService({
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
    } catch (error) {
        return next(error);
    }
};

const getSellById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;

        const { Serie, Id_Almacen, TipoDoc } = getSellByIdQuerySchema.parse(req.query);
        const { folio } = getFolioParamsSchema.parse(req.params);

        const sell = await getSellByIdService(
            userSession,
            folio,
            Serie,
            Id_Almacen,
            TipoDoc
        );

        return res.json({
            sell
        });
    } catch (error) {
        return next(error);
    };

};

export {
    getSells,
    getSellsCountAndTotal,
    getSellsByClient,
    getSellsByClientCountAndTotal,
    getSellById
}