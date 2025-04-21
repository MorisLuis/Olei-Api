import { dbConnectionWeb } from "../database";
import { statisticsQuery } from "../database/querys/statistics";
import { ValidationError } from "../errors/CustomError";
import type { UserWebSessionInterface } from "../interface/user";


interface CRMBriefRow {
    BitacoraCount: number;
    VentasCount: number;
};

type CRMBriefRecordsets = [CRMBriefRow[], CRMBriefRow[]];

const getCRMBriefService = async (
    userSession: UserWebSessionInterface
): Promise<{
    eventsToday: number;
    sellsToday: number;
    eventsWeek: number;
    sellsWeek: number;
}> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const query = statisticsQuery.getCRMBrief;
    const request = await pool.request().query(query);

    if (!Array.isArray(request.recordsets) || request.recordsets.length < 2) {
        throw new Error('El query no devolvió los recordsets esperados');
    }

    const recordsets = request.recordsets as unknown as CRMBriefRecordsets;

    const [todayStats, weekStats] = recordsets;

    return {
        eventsToday: todayStats[0].BitacoraCount,
        sellsToday: todayStats[0].VentasCount,
        eventsWeek: weekStats[0].BitacoraCount,
        sellsWeek: weekStats[0].VentasCount,
    };
};

export {
    getCRMBriefService
}