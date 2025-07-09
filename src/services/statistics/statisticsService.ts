import { dbConnectionWeb } from "../../database";
import { statisticsQuery } from "../../database/querys/statistics";
import { ValidationError } from "../../errors/CustomError";
import type { UserWebSessionInterface } from "../../interface/user";
import type { StatisticsCRMDashboardResponse } from "./statisticsService.interface";


const getStatisticsCRMDashboard = async (
    userSession: UserWebSessionInterface
): Promise<StatisticsCRMDashboardResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };


    const requestEventsOfTheWeek = await pool.request()
        .query(statisticsQuery.getEventsOfTheWeek);

    const requestSellsOfTheMonth = await pool.request()
        .query(statisticsQuery.getSellsOfTheMonth);

    const requestSellsOfToday = await pool.request()
        .query(statisticsQuery.getSellsOfToday);

    const requestWeeklyAndForwardSaldo = await pool.request()
        .query(statisticsQuery.getWeeklyAndForwardSaldo);

    const requestProductsAndSellersOfTheMonth = await pool.request()
        .query(statisticsQuery.getProductsAndSellersOfTheMonth);


    const [
        responseEventsOfTheWeek,
        responseSellsOfTheMonth,
        responseSellsOfToday,
        responseWeeklyAndForwardSaldo,
        responseProductsAndSellersOfTheMonth
    ] = await Promise.all([
        requestEventsOfTheWeek,
        requestSellsOfTheMonth,
        requestSellsOfToday,
        requestWeeklyAndForwardSaldo,
        requestProductsAndSellersOfTheMonth
    ]);

    const { eventsWeek, sellsWeek } = responseEventsOfTheWeek.recordset[0];
    const { TotalProductos, TotalClientes  } = responseProductsAndSellersOfTheMonth.recordset[0]
    const sells = responseSellsOfTheMonth.recordset;
    const sellsToday = responseSellsOfToday.recordset[0];
    const cobranza = responseWeeklyAndForwardSaldo.recordset;

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

export {
    getStatisticsCRMDashboard
}