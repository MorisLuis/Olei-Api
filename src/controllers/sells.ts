import { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService, getCobranzaService, getTotalSellsService, getTotalSellsByClientService, getTotalCobranzaService } from "../services/sellsDocsServices";
import { getTotalSellsByClientQuerySchema, getClientParamsSchema, getSellsQuerySchema, getSellByIdQuerySchema, getSellByIdParamsSchema, getSellsByClientQuerySchema, getCobranzaQuerySchema, getTotalCobranzaQuerySchema } from '../validations/sellsValidations'
import { z } from "zod";

const getSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, sellsOrderCondition } = getSellsQuerySchema.parse(req.query)
        const sessionId = req.sessionRedis

        const sells = await getSellsService(
            sessionId,
            PageNumber,
            sellsOrderCondition
        );

        return res.json(sells);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    };

};

const getSellById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const sessionId = req.sessionRedis;

        const { Serie, Id_Almacen, TipoDoc } = getSellByIdQuerySchema.parse(req.query);
        const { folio } = getSellByIdParamsSchema.parse(req.params);

        const sell = await getSellByIdService(
            sessionId,
            folio,
            Serie,
            Id_Almacen,
            TipoDoc
        );

        return res.json(sell);
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

        const sessionId = req.sessionRedis;
        const sells = await getSellsByClientService({
            sessionId,
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

        return res.json(sells);
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
        const sessionId = req.sessionRedis;

        const sells = await getCobranzaService({
            sessionId,
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

        return res.json(sells);
    } catch (error) {
        return next(error)
    };
};

const getTotalSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const sessionId = req.sessionRedis;
        const total = await getTotalSellsService(sessionId)
        return res.json(total);
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
            sessionId: req.sessionRedis,
            Id_Cliente: params.client,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        });

        return res.json(total);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
};


const getTotalCobranza = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { FilterTipoDoc, TipoDoc, FilterNotExpired, FilterExpired, DateEnd, DateExactly, DateStart } = getTotalCobranzaQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const sessionId = req.sessionRedis;

        const total = await getTotalCobranzaService({
            Id_Cliente: client,
            sessionId,
            TipoDoc,
            FilterTipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        })
        return res.json(total);

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