import { dbConnectionWeb } from "../database";
import { statisticsQuery } from "../database/querys/statistics";
import { ValidationError } from "../errors/CustomError";
import type { UserWebSessionInterface } from "../interface/user";


const getStatisticsCRMDashboard = async (
    userSession: UserWebSessionInterface
): Promise<{
    eventsToday: number;
    sellsToday: number;
    eventsWeek: number;
    sellsWeek: number;
    sells: { period: number, sellsByMonth: number }[];
    cobranza: { type: string, sumCobranzaExpired: number, sumCobranza: number }[];
}> => {

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

    const [
        responseEventsOfTheDay,
        responseEventsOfTheWeek,
        responseSellsOfTheMonth,
        responseWeeklyAndForwardSaldo
    ] = await Promise.all([
        requestEventsOfTheDay,
        requestEventsOfTheWeek,
        requestSellsOfTheMonth,
        requestWeeklyAndForwardSaldo
    ]);

    const { eventsToday, sellsToday } = responseEventsOfTheDay.recordset[0];
    const { eventsWeek, sellsWeek } = responseEventsOfTheWeek.recordset[0];
    const sells = responseSellsOfTheMonth.recordset;
    const cobranza = responseWeeklyAndForwardSaldo.recordset;


    return {
        eventsToday,
        sellsToday,
        eventsWeek,
        sellsWeek,
        sells,
        cobranza
    };
};

export {
    getStatisticsCRMDashboard
}