import type { NextFunction, Request, Response } from 'express';
import { successResponse } from "../../helpers/response";
import { getInformesiaService, postInformesiaService } from "../../services/informesia/informesia.service";
import { postInformesiaParamsValidations, postInformesiaValidations } from '../../validations/informesiaValidations';


export const getInformesia = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userSession = req.sessionWeb;
        const { PageNumber } = req.query;
        const informesia = await getInformesiaService({ userSession, PageNumber: Number(PageNumber) });
        return successResponse(req, res, informesia, "Reporte AI exitosa", 200);
    } catch (error) {
        return next(error)
    }
}


export const postInformesia = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userSession = req.sessionWeb;
        const body = postInformesiaValidations.parse(req.body);
        const { queryId } = postInformesiaParamsValidations.parse(req.query);

        await postInformesiaService({ userSession, body, queryId, res });

        return successResponse(req, res, { ok: true }, "Reporte AI exitosa", 201);
    } catch (error) {
        return next(error)
    }
}