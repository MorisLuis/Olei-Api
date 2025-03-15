import { NextFunction, Request, Response } from "express"
import { getClientParamsSchema, getCobranzaQuerySchema } from "../validations/sellsValidations";
import { reportsCobranzaService } from "../services/resportsService";
import { z } from "zod";

const getExcellCobranza = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { PageNumber, sellsOrderCondition, FilterTipoDoc, TipoDoc, FilterExpired, FilterNotExpired, DateEnd, DateExactly, DateStart } = getCobranzaQuerySchema.parse(req.query);
        const { client } = getClientParamsSchema.parse(req.params);
        const sessionId = req.sessionRedis;

        await reportsCobranzaService({
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
            res: res
        });   
    
        res.json({ ok: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    };
};

export {
    getExcellCobranza
}