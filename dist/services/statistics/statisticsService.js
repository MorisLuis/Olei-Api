"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatisticsCRMDashboard = void 0;
const database_1 = require("../../database");
const statistics_1 = require("../../database/querys/statistics");
const CustomError_1 = require("../../errors/CustomError");
const getStatisticsCRMDashboard = async (userSession) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    const requestSellsOfTheMonth = await pool.request()
        .query(statistics_1.statisticsQuery.getSellsOfTheMonth);
    const requestSellsOfToday = await pool.request()
        .query(statistics_1.statisticsQuery.getSellsOfToday);
    const requestCobranzaStats = await pool.request()
        .query(statistics_1.statisticsQuery.getCobranzaStats);
    const requestAbonosStats = await pool.request()
        .query(statistics_1.statisticsQuery.getAbonosStats);
    const [responseSellsOfTheMonth, responseSellsOfToday, responseCobranzaStats, responseAbonosStats] = await Promise.all([
        requestSellsOfTheMonth,
        requestSellsOfToday,
        requestCobranzaStats,
        requestAbonosStats
    ]);
    const sells = responseSellsOfTheMonth.recordset;
    const sellsToday = responseSellsOfToday.recordset[0];
    const cobranza = responseCobranzaStats.recordset;
    const abonos = responseAbonosStats.recordset;
    return {
        sellsToday,
        sells,
        cobranza,
        abonos
    };
};
exports.getStatisticsCRMDashboard = getStatisticsCRMDashboard;
//# sourceMappingURL=statisticsService.js.map