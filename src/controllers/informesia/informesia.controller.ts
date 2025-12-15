import type { NextFunction, Request, Response } from 'express';
import { successResponse } from "../../helpers/response";
import { getInformesiaService, postInformesiaService } from "../../services/informesia/informesia.service";
import { postInformesiaValidations } from '../../validations/informesiaValidations';


export const getInformesia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userSession = req.sessionWeb;
        const { PageNumber } = req.query;
        const informesia = await getInformesiaService({ userSession, PageNumber: Number(PageNumber) });
        return successResponse(req, res, informesia, "Reporte AI exitosa", 200);
    } catch (error) {
        return next(error)
    }
}


export const postInformesia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userSession = req.sessionWeb;
        const body = postInformesiaValidations.parse(req.body);

        await postInformesiaService({ userSession, body });

        return successResponse(req, res, { ok: true }, "Reporte AI exitosa", 201);
    } catch (error) {
        return next(error)
    }
}