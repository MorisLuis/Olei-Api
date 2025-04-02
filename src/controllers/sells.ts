import { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService, getCobranzaService, getTotalSellsService, getTotalSellsByClientService, getTotalCobranzaService } from "../services/sellsDocsServices";
import { getTotalSellsByClientQuerySchema, getClientParamsSchema, getSellsQuerySchema, getSellByIdQuerySchema, getSellByIdParamsSchema, getSellsByClientQuerySchema, getCobranzaQuerySchema, getTotalCobranzaQuerySchema } from '../validations/sellsValidations'
import { z } from "zod";

const getSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, sellsOrderCondition } = getSellsQuerySchema.parse(req.query)
        const userSession = req.sessionWeb

        const sells = await getSellsService(
            userSession,
            PageNumber,
            sellsOrderCondition
        );

        return res.json({
            sells
        });
    } catch (error) {
        return next(error);
    };

};

const getSellById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const userSession = req.sessionWeb;

        const { Serie, Id_Almacen, TipoDoc } = getSellByIdQuerySchema.parse(req.query);
        const { folio } = getSellByIdParamsSchema.parse(req.params);

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
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    };

};

const getSellsByClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = getSellsByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);

        const userSession = req.sessionWeb;
        const sells = await getSellsByClientService({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc,
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
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
};

const getCobranza = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const sells = await getCobranzaService({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: sellsOrderCondition,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });

        return res.json({
            sells
        });
    } catch (error) {
        return next(error)
    };
};

const getTotalSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const total = await getTotalSellsService(userSession)
        return res.json({ total });
    } catch (error) {
        return next(error);
    }
}

const getTotalSellsByClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const params = getClientParamsSchema.parse(req.params);
        const {
            FilterTipoDoc,
            FilterExpired,
            FilterNotExpired,
            TipoDoc,
            DateEnd,
            DateExactly,
            DateStart,
        } = getTotalSellsByClientQuerySchema.parse(req.query);

        const total = await getTotalSellsByClientService({
            userSession: req.sessionWeb,
            Id_Cliente: params.client,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });

        return res.json({
            total
        });
    } catch (error) {
        return next(error);

    }
};


const getTotalCobranza = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { FilterTipoDoc, TipoDoc, FilterNotExpired, FilterExpired, DateEnd, DateExactly, DateStart } = getTotalCobranzaQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const total = await getTotalCobranzaService({
            Id_Cliente: client,
            userSession,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        })
        return res.json({total});

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
}


export {
    getSells,
    getSellsByClient,
    getSellById,
    getCobranza,
    getTotalSells,
    getTotalSellsByClient,
    getTotalCobranza
}