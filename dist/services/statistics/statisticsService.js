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
    const requestEventsOfTheDay = await pool.request()
        .query(statistics_1.statisticsQuery.getEventsOfTheDay);
    const requestEventsOfTheWeek = await pool.request()
        .query(statistics_1.statisticsQuery.getEventsOfTheWeek);
    const requestSellsOfTheMonth = await pool.request()
        .query(statistics_1.statisticsQuery.getSellsOfTheMonth);
    const requestWeeklyAndForwardSaldo = await pool.request()
        .query(statistics_1.statisticsQuery.getWeeklyAndForwardSaldo);
    const requestProductsAndSellersOfTheMonth = await pool.request()
        .query(statistics_1.statisticsQuery.getProductsAndSellersOfTheMonth);
    const [responseEventsOfTheDay, responseEventsOfTheWeek, responseSellsOfTheMonth, responseWeeklyAndForwardSaldo, responseProductsAndSellersOfTheMonth] = await Promise.all([
        requestEventsOfTheDay,
        requestEventsOfTheWeek,
        requestSellsOfTheMonth,
        requestWeeklyAndForwardSaldo,
        requestProductsAndSellersOfTheMonth
    ]);
    const { eventsToday, sellsToday } = responseEventsOfTheDay.recordset[0];
    const { eventsWeek, sellsWeek } = responseEventsOfTheWeek.recordset[0];
    const { TotalProductos, TotalClientes } = responseProductsAndSellersOfTheMonth.recordset[0];
    const sells = responseSellsOfTheMonth.recordset;
    const cobranza = responseWeeklyAndForwardSaldo.recordset;
    return {
        eventsToday,
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