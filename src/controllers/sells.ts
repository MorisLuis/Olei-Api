import type { NextFunction, Request, Response } from "express"
import { getSellsService, getSellsByClientService, getSellByIdService } from "../services/sells/sellsDocsServices";
import { getClientParamsSchema, getSellsQuerySchema, getSellByIdQuerySchema, getSellByIdParamsSchema, getSellsByClientQuerySchema, getCobranzaQuerySchema, getCobranzaByClientQuerySchema, getCobranzaByClientCountAndTotalQuerySchema } from '../validations/sellsValidations'
import { z } from "zod";
import { getCobranzaByClientCountAndTotalService, getCobranzaByClientService, getCobranzaService, getCobranzaWithTotalsService } from "../services/cobranza/cobranzaService";

const getSells = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { PageNumber, sellsOrderCondition, searchTerm } = getSellsQuerySchema.parse(req.query)
        const userSession = req.sessionWeb;


        const { sells, count, total } = await getSellsService(
            userSession,
            PageNumber,
            sellsOrderCondition,
            searchTerm
        );

        return res.json({
            sells,
            count,
            total
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
        const { sells, count, total } = await getSellsByClientService({
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
            sells,
            count,
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
        const { PageNumber, cobranzaOrderCondition, termSearch } = getCobranzaQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { cobranza, count, total } = await getCobranzaService({
            userSession,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            termSearch
        });

        return res.json({
            cobranza,
            count,
            total
        });

    } catch (error) {
        return next(error)
    }
};

const getCobranzaByClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { Id_Almacen, PageNumber, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaByClientQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const { cobranza } = await getCobranzaByClientService({
            userSession,
            Id_Cliente: client,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Id_Almacen
        });

        return res.json({
            cobranza
        });
    } catch (error) {
        return next(error)
    };
};

const getCobranzaByClientCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { Id_Almacen, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaByClientCountAndTotalQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const userSession = req.sessionWeb;

        const { count, total } = await getCobranzaByClientCountAndTotalService({
            userSession,
            Id_Cliente: client,
            TipoDoc,
            FilterNotExpired,
            FilterExpired,
            DateEnd: DateEnd || null,
            DateExactly: DateExactly || null,
            DateStart: DateStart || null,
            Id_Almacen
        });

        return res.json({
            count,
            total
        });
    } catch (error) {
        return next(error)
    };
};

const getCobranzaWithTotals = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        // Get session from REDIS.
        const { Id_Almacen, cobranzaOrderCondition, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaByClientQuerySchema.parse(req.query);
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
            DateStart: DateStart || null,
            Id_Almacen
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

    /* cobranza */
    getCobranza,
    getCobranzaByClient,
    getCobranzaByClientCountAndTotal,
    getCobranzaWithTotals
}