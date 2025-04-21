"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCRMBrief = void 0;
const statisticsService_1 = require("../services/statisticsService");
const getCRMBrief = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { eventsToday, sellsToday, eventsWeek, sellsWeek } = await (0, statisticsService_1.getCRMBriefService)(userSession);
        return res.json({
            eventsToday, sellsToday, eventsWeek, sellsWeek
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCRMBrief = getCRMBrief;
//# sourceMappingURL=statistics.js.map