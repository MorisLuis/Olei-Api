import type { IRecordSet } from "mssql";
import { dbConnectionWeb } from "../../database";
import { celendarQuerys } from "../../database/querys/calendar";
import { ValidationError } from "../../errors/CustomError";
import type { CalendarInterface } from "../../interface/calendar";
import type { UserWebSessionInterface } from "../../interface/user";

interface getCalendarTaskByDayServiceInterface {
    userSession: UserWebSessionInterface;
    Day: string;
    Id_Cliente: number | null
    PageNumber: number
    limit: number
}

interface getCalendarTaskByDayAndClientResponse {
    quotes: CalendarInterface[];
    TotalBitacora: number;
    TotalVentas: number;
}

const getCalendarTaskByDayAndClientService = async ({
    userSession,
    Day,
    Id_Cliente,
    PageNumber,
    limit
}: getCalendarTaskByDayServiceInterface)  : Promise<getCalendarTaskByDayAndClientResponse> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = celendarQuerys.getCalendarTasksByDay;

    const request = await pool.request()
        .input('FechaEspecifica', Day)
        .input('Id_Cliente', Id_Cliente)
        .input('Page', PageNumber)
        .input('limit', limit)
        .query(query);

    const quotes = request.recordset;
    const TotalBitacora = (request.recordsets as IRecordSet<{ TotalBitacora: number }>[])[1][0].TotalBitacora;
    const TotalVentas = (request.recordsets as IRecordSet<{ TotalVentas: number }>[])[2][0].TotalVentas;

    return {
        quotes,
        TotalBitacora,
        TotalVentas
    }
};

/* const groupedByDay = (tasks: Record<string, unknown>[]) => {
	const grouped = tasks.reduce((acc: Record<string, unknown[]>, task: Record<string, unknown>) => {
		const date = task.FechaInicio.toISOString().split('T')[0];
		if (!acc[date]) {
			acc[date] = [];
		}
		acc[date].push(task);
		return acc;
	}, {});
	return Object.keys(grouped).map((date) => ({ date, tasks: grouped[date] }));
}; */

export {
    getCalendarTaskByDayAndClientService
}