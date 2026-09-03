import type { NextFunction, Request, Response } from 'express';
import { successResponse } from "../../helpers/response";
import { getInformesiaService, postInformesiaService } from "../../services/informesia/informesia.service";
import { postInformesiaParamsValidations, postInformesiaValidations } from '../../validations/informesiaValidations';


/** 
 * @description Returns CRM Informesia records for the current tenant.
 * @client CRM
 * @router GET /api/informesia
 * @request Supported query filters; requires the CRM web tenant session.
 * @response Standard success response with Informesia data; failures are forwarded to `next`.
 */
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


/** 
 * @description Creates a CRM Informesia record for the current tenant.
 * @client CRM
 * @router POST /api/informesia
 * @request Validated Informesia body; requires the CRM web tenant session.
 * @response Standard success response with the created result; failures are forwarded to `next`.
 */
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
