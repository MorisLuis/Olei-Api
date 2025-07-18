import type { NextFunction, Request, Response } from "express"
import { getStatisticsCRMDashboard } from "../services/statistics/statisticsService";

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