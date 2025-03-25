import { dbConnectionWeb } from "../database";
import { celendarQuerys } from "../database/querys/calendar";
import { ValidationError } from "../errors/CustomError";
import MeetingInterface from "../interface/meeting";
import { UserWebSessionInterface } from "../interface/user";

interface getCalendarServiceInterface {
    userSession: UserWebSessionInterface;
    Mes: string;
    Anio: string
}

const getCalendarTaskByMonthService = async ({
    userSession,
    Mes,
    Anio
}: getCalendarServiceInterface): Promise<MeetingInterface[]> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
    userSession: UserWebSessionInterface;
    Day: string;
}

const getCalendarTaskByDayService = async ({
    userSession,
    Day
}: getCalendarTaskByDayServiceInterface)  : Promise<MeetingInterface[]> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
    userSession: UserWebSessionInterface;
    Mes: number | string;
    Anio: number | string;
    Id_Cliente: number;
}

const getCalendarTaskByMonthAndClientService = async ({
    userSession,
    Mes,
    Anio,
    Id_Cliente
}: getCalendarByMonthAndClientServiceInterface) : Promise<MeetingInterface[]>  => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

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
