import type { NextFunction, Request, Response } from "express"
import { getClientParamsSchema } from '../../validations/sellsValidations'
import { getCobranzaByClientCountAndTotalService, getCobranzaByClientService, getCobranzaCountAndTotalService, getCobranzaService, getCobranzaWithTotalsService } from "../../services/cobranza/cobranzaService";
import { getCobranzaQuerySchema, getCobranzaByClientQuerySchema, getCobranzaByClientCountAndTotalQuerySchema, getCobranzaQueryCountAndTotalSchema } from "../../validations/cobranzaValidations";


/* Cobranza */
const getCobranza = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Get session from REDIS.
        const { PageNumber, cobranzaOrderCondition, termSearch } = getCobranzaQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { cobranza } = await getCobranzaService({
            userSession,
            PageNumber,
            SellsOrderCondition: cobranzaOrderCondition,
            termSearch
        });

        return res.json({
            cobranza
        });

    } catch (error) {
        return next(error)
    }
};

const getCobranzaCountAndTotal = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Get session from REDIS.
        const { termSearch } = getCobranzaQueryCountAndTotalSchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { count, total } = await getCobranzaCountAndTotalService({
            userSession,
            termSearch
        });

        return res.json({
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

        const { SaldoVencido, SaldoNoVencido, TotalSaldo } = await getCobranzaWithTotalsService({
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
            SaldoVencido, SaldoNoVencido, TotalSaldo
        });
    } catch (error) {
        return next(error)
    };
};

export {
    getCobranza,
    getCobranzaCountAndTotal,
    getCobranzaByClient,
    getCobranzaByClientCountAndTotal,
    getCobranzaWithTotals
}