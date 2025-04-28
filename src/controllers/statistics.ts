import type { NextFunction, Request, Response } from "express"
import { getCRMBriefService } from "../services/statisticsService";

const getCRMBrief = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const userSession = req.sessionWeb;
        const { eventsToday, sellsToday, eventsWeek, sellsWeek  } = await getCRMBriefService(userSession);

        return res.json({
            eventsToday, sellsToday, eventsWeek, sellsWeek
        });

    } catch (error) {
        return next(error)
    }
};

export {
    getCRMBrief
}