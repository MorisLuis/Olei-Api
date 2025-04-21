"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCRMBriefService = void 0;
const database_1 = require("../database");
const statistics_1 = require("../database/querys/statistics");
const CustomError_1 = require("../errors/CustomError");
;
const getCRMBriefService = async (userSession) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    const query = statistics_1.statisticsQuery.getCRMBrief;
    const request = await pool.request().query(query);
    if (!Array.isArray(request.recordsets) || request.recordsets.length < 2) {
        throw new Error('El query no devolvió los recordsets esperados');
    }
    const recordsets = request.recordsets;
    const [todayStats, weekStats] = recordsets;
    return {
        eventsToday: todayStats[0].BitacoraCount,
        sellsToday: todayStats[0].VentasCount,
        eventsWeek: weekStats[0].BitacoraCount,
        sellsWeek: weekStats[0].VentasCount,
    };
};
exports.getCRMBriefService = getCRMBriefService;
//# sourceMappingURL=statisticsService.js.map