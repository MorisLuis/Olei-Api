import type { NextFunction, Request, Response } from "express";
import { getCalendarTaskByMonthAndClientService, getCalendarTaskByMonthService } from "../services/calendarService";
import { getCalendarByMonthAndClientQuerySchema, getCalendarTaskByDayQuerySchema, getCalendarTaskByMonthQuerySchema } from "../validations/calendarValidations";
import { getCalendarTaskByDayAndClientService } from "../services/calendar/getAllTasksByDay";


const getCalendarTaskByMonth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { Anio, Mes } = getCalendarTaskByMonthQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const tasks = await getCalendarTaskByMonthService({
            userSession,
            Anio,
            Mes,
        });

        return res.json({
            tasks
        });
    } catch (error) {
        return next(error);

    }
};

const getCalendarTaskByDay = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    /* Timeline */
    try {
        const { Day, Id_Cliente, limit, PageNumber } = getCalendarTaskByDayQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const { tasks, TotalBitacora, TotalVentas } = await getCalendarTaskByDayAndClientService({
            userSession,
            Day,
            Id_Cliente,
            PageNumber: PageNumber || 1,
            limit: limit || 10
        });

        res.json({
            tasks,
            TotalBitacora,
            TotalVentas
        });
    } catch (error) {
        return next(error);

    };

};

const getCalendarTaskByMonthAndClient = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    try {
        const { Anio, Mes, Id_Cliente } = getCalendarByMonthAndClientQuerySchema.parse(req.query);
        const userSession = req.sessionWeb

        const tasks = await getCalendarTaskByMonthAndClientService({
            userSession,
            Anio,
            Mes,
            Id_Cliente
        });

        return res.json({
            tasks
        });
    } catch (error) {
        return next(error);
    };

};


export {
    getCalendarTaskByMonth,
    getCalendarTaskByDay,
    getCalendarTaskByMonthAndClient
}