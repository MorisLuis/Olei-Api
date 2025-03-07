import { dbConnection } from "../database";
import { celendarQuerys } from "../database/querys/calendar";
import { UnauthorizedError, ValidationError } from "../errors/CustomError";
import { handleGetWebSession } from "../utils/Redis/getSession";

interface getCalendarServiceInterface {
    sessionId: string;
    Mes: string;
    Anio: string
}

const getCalendarTaskByMonthService = async ({
    sessionId,
    Mes,
    Anio
}: getCalendarServiceInterface ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = celendarQuerys.getCalendarTasksMonth;
    const request = await pool.request()
        .input('Anio', Anio)
        .input('Mes', Mes)
        .query(query);

    const quotes = request.recordset

    return quotes
};


interface getCalendarTaskByDayServiceInterface {
    sessionId: string;
    Day: string;
}

const getCalendarTaskByDayService = async ({
    sessionId,
    Day
}: getCalendarTaskByDayServiceInterface ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = celendarQuerys.getCalendarTasksDay;
    const request = await pool.request()
        .input('FechaEspecifica', Day)
        .query(query);

    const quotes = request.recordset

    return quotes
};

interface getCalendarByMonthAndClientServiceInterface {
    sessionId: string;
    Mes: number | string;
    Anio: number | string;
    Id_Cliente: number;
}

const getCalendarTaskByMonthAndClientService = async ({
    sessionId,
    Mes,
    Anio,
    Id_Cliente
}: getCalendarByMonthAndClientServiceInterface ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = celendarQuerys.getCalendarTasksMonthByClient;
    const request = await pool.request()
        .input('Anio', Anio)
        .input('Mes', Mes)
        .input('Id_Cliente', Id_Cliente)
        .query(query);

    const quotes = request.recordset

    return quotes
};


export {
    getCalendarTaskByMonthService,
    getCalendarTaskByDayService,
    getCalendarTaskByMonthAndClientService
}
