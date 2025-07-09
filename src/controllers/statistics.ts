import type { NextFunction, Request, Response } from "express"
import { getStatisticsCRMDashboard } from "../services/statistics/statisticsService";

const getCRMBrief = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const {
            sellsToday,
            eventsWeek,
            sellsWeek,
            productsSoldMonth,
            sellerOfMonth,
            sells,
            cobranza
        } = await getStatisticsCRMDashboard(userSession);

        return res.json({
            sellsToday,
            eventsWeek,
            sellsWeek,
            productsSoldMonth,
            sellerOfMonth,
            sells,
            cobranza
        });

    } catch (error) {
        return next(error)
    }
};

export {
    getCRMBrief
}