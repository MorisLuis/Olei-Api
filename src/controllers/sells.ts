import type { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService, getTotalSellsService, getTotalSellsByClientService } from "../services/sellsDocsServices";
import { getTotalSellsByClientQuerySchema, getClientParamsSchema, getSellsQuerySchema, getSellByIdQuerySchema, getSellByIdParamsSchema, getSellsByClientQuerySchema, getCobranzaQuerySchema, getTotalCobranzaQuerySchema, getCobranzaByClientQuerySchema } from '../validations/sellsValidations'
import { z } from "zod";
import { getCobranzaByClientService, getCobranzaService, getCobranzaWithTotalsService, getTotalCobranzaService } from "../services/cobranza/cobranzaService";

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
        const { PageNumber, sellsOrderCondition, FilterExpired, FilterNotExpired, TipoDoc, DateEnd, DateExactly, DateStart } = getSellsByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);

        const userSession = req.sessionWeb;
        const sells = await getSellsByClientService({
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
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
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


/* Cobranza */
const getCobranza = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Get session from REDIS.
        const { PageNumber, cobranzaOrderCondition } = getCobranzaQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { cobranza } = await getCobranzaService({
            userSession,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition
        });

        return res.json({
            cobranza
        });

    } catch (error) {
        return next(error)
    }
};

const getCobranzaByClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const { Id_Almacen, PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const { cobranza } = await getCobranzaByClientService({
            Id_Almacen,
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });

        return res.json({
            cobranza
        });
    } catch (error) {
        return next(error)
    };
};

const getTotalCobranza = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { TipoDoc, FilterNotExpired, FilterExpired, DateEnd, DateExactly, DateStart } = getTotalCobranzaQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const total = await getTotalCobranzaService({
            Id_Cliente: client,
            userSession,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
        })
        return res.json({ total });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
};

const getCobranzaWithTotals = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const { cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const { brief } = await getCobranzaWithTotalsService({
            userSession,
            Id_Cliente: client,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null
        });

        return res.json({
            brief
        });
    } catch (error) {
        return next(error)
    };
};

export {
    getSells,
    getSellsByClient,
    getSellById,
    getTotalSells,
    getTotalSellsByClient,

    /* cobranza */
    getCobranzaByClient,
    getCobranza,
    getTotalCobranza,
    getCobranzaWithTotals
}