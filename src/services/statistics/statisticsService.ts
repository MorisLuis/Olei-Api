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

    const requestSellsOfTheMonth = await pool.request()
        .query(statisticsQuery.getSellsOfTheMonth);

    const requestSellsOfToday = await pool.request()
        .query(statisticsQuery.getSellsOfToday);

    const requestCobranzaStats = await pool.request()
        .query(statisticsQuery.getCobranzaStats);

    const requestAbonosStats = await pool.request()
        .query(statisticsQuery.getAbonosStats);

    const [
        responseSellsOfTheMonth,
        responseSellsOfToday,
        responseCobranzaStats,
        responseAbonosStats
    ] = await Promise.all([
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

export {
    getStatisticsCRMDashboard
}