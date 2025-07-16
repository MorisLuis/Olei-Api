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
    const requestEventsOfTheWeek = await pool.request()
        .query(statistics_1.statisticsQuery.getEventsOfTheWeek);
    const requestSellsOfTheMonth = await pool.request()
        .query(statistics_1.statisticsQuery.getSellsOfTheMonth);
    const requestSellsOfToday = await pool.request()
        .query(statistics_1.statisticsQuery.getSellsOfToday);
    const requestCobranzaStats = await pool.request()
        .query(statistics_1.statisticsQuery.getCobranzaStats);
    const requestProductsAndSellersOfTheMonth = await pool.request()
        .query(statistics_1.statisticsQuery.getProductsAndSellersOfTheMonth);
    const [responseEventsOfTheWeek, responseSellsOfTheMonth, responseSellsOfToday, responseCobranzaStats, responseProductsAndSellersOfTheMonth] = await Promise.all([
        requestEventsOfTheWeek,
        requestSellsOfTheMonth,
        requestSellsOfToday,
        requestCobranzaStats,
        requestProductsAndSellersOfTheMonth
    ]);
    const { eventsWeek, sellsWeek } = responseEventsOfTheWeek.recordset[0];
    const { TotalProductos, TotalClientes } = responseProductsAndSellersOfTheMonth.recordset[0];
    const sells = responseSellsOfTheMonth.recordset;
    const sellsToday = responseSellsOfToday.recordset[0];
    const cobranza = responseCobranzaStats.recordset;
    return {
        sellsToday,
        eventsWeek,
        sellsWeek,
        productsSoldMonth: TotalProductos,
        sellerOfMonth: TotalClientes,
        sells,
        cobranza
    };
};
exports.getStatisticsCRMDashboard = getStatisticsCRMDashboard;
//# sourceMappingURL=statisticsService.js.map