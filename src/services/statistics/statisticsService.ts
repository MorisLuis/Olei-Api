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

    const requestEventsOfTheDay = await pool.request()
        .query(statisticsQuery.getEventsOfTheDay);

    const requestEventsOfTheWeek = await pool.request()
        .query(statisticsQuery.getEventsOfTheWeek);

    const requestSellsOfTheMonth = await pool.request()
        .query(statisticsQuery.getSellsOfTheMonth);

    const requestWeeklyAndForwardSaldo = await pool.request()
        .query(statisticsQuery.getWeeklyAndForwardSaldo);

    const requestProductsAndSellersOfTheMonth = await pool.request()
        .query(statisticsQuery.getProductsAndSellersOfTheMonth);


    const [
        responseEventsOfTheDay,
        responseEventsOfTheWeek,
        responseSellsOfTheMonth,
        responseWeeklyAndForwardSaldo,
        responseProductsAndSellersOfTheMonth
    ] = await Promise.all([
        requestEventsOfTheDay,
        requestEventsOfTheWeek,
        requestSellsOfTheMonth,
        requestWeeklyAndForwardSaldo,
        requestProductsAndSellersOfTheMonth
    ]);

    const { eventsToday, sellsToday } = responseEventsOfTheDay.recordset[0];
    const { eventsWeek, sellsWeek } = responseEventsOfTheWeek.recordset[0];
    const { TotalProductos, TotalClientes  } = responseProductsAndSellersOfTheMonth.recordset[0]
    const sells = responseSellsOfTheMonth.recordset;
    const cobranza = responseWeeklyAndForwardSaldo.recordset;

    console.log({
        eventsToday,
        sellsToday,
        eventsWeek,
        sellsWeek,
        productsSoldMonth: TotalProductos, 
        sellerOfMonth: TotalClientes,
        sells,
        cobranza
    })

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

export {
    getStatisticsCRMDashboard
}