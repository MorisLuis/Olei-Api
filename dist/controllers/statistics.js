"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCRMBrief = void 0;
const statisticsService_1 = require("../services/statistics/statisticsService");
const getCRMBrief = async (req, res, next) => {
    try {
        const userSession = req.sessionWeb;
        const { sellsToday, sells, cobranza, abonos } = await (0, statisticsService_1.getStatisticsCRMDashboard)(userSession);
        return res.json({
            sellsToday,
            sells,
            cobranza,
            abonos
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCRMBrief = getCRMBrief;
//# sourceMappingURL=statistics.js.map