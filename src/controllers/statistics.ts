import type { NextFunction, Request, Response } from "express"
import { getStatisticsCRMDashboard } from "../services/statisticsService";

const getCRMBrief = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const {
            eventsToday,
            sellsToday,
            eventsWeek,
            sellsWeek,
            sells,
            cobranza
        } = await getStatisticsCRMDashboard(userSession);

        return res.json({
            eventsToday,
            sellsToday,
            eventsWeek,
            sellsWeek,
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