import type { IRecordSet } from "mssql";
import { dbConnectionWeb } from "../../database";
import { celendarQuerys } from "../../database/querys/calendar";
import { ValidationError } from "../../errors/CustomError";
import type { getCalendarTaskByDayAndClientResponse, getCalendarTaskByDayServiceInterface, TaskOfDay } from "./types";

const getCalendarTaskByDayAndClientService = async ({
    userSession,
    Day,
    Id_Cliente,
    PageNumber,
    limit
}: getCalendarTaskByDayServiceInterface): Promise<getCalendarTaskByDayAndClientResponse> => {

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

    const rawQuotes = request.recordset;
    const TotalBitacora = (request.recordsets as IRecordSet<{ TotalBitacora: number }>[])[1][0].TotalBitacora;
    const TotalVentas = (request.recordsets as IRecordSet<{ TotalVentas: number }>[])[2][0].TotalVentas;

    const quotes: TaskOfDay[] = rawQuotes.map((quote) => {
        const baseDate = new Date(quote.Fecha).toISOString().split('T')[0];
        const startTime = quote.Hour || '00:00:00';
        const endTime = quote.HourEnd || '23:59:59';

        return {
            id: quote.Id_Bitacora?.toString() || quote.Id_Sell?.toString() || '',
            title: quote.Titulo || quote.Descripcion || '',
            start: `${baseDate}T${startTime}`,
            end: `${baseDate}T${endTime}`,
            tableType: quote.TableType,
            idCliente: quote.Id_Cliente,
            descripcion: quote.Descripcion,
            folio: quote.Folio,
            extendedProps: {
                Id_Bitacora: quote.Id_Bitacora,
            }
        };
    });

    return {
        tasks: quotes,
        TotalBitacora,
        TotalVentas
    }
};

export {
    getCalendarTaskByDayAndClientService
}