import type { NextFunction, Request, Response } from "express"
import { getStatisticsCRMDashboard } from "../services/statistics/statisticsService";

/**
 * @description Returns the CRM dashboard summary for sales, receivables, and payments.
 * @client CRM
 * @router GET /api/statistics/crm-brief
 * @session Requires the CRM web tenant session.
 * @response JSON containing `sellsToday`, `sells`, `cobranza`, and `abonos`; service failures are forwarded to `next`.
 */
const getCRMBrief = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const {
            sellsToday,
            sells,
            cobranza,
            abonos
        } = await getStatisticsCRMDashboard(userSession);

        return res.json({
            sellsToday,
            sells,
            cobranza,
            abonos
        });

    } catch (error) {
        return next(error)
    }
};

export {
    getCRMBrief
}
