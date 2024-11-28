import { NextFunction, Request, Response } from "express";
import { getCalendarTaskByDayService, getCalendarTaskByMonthService } from "../services/calendarService";
import BadRequestError from "../errors/BadRequestError";


const getCalendarTaskByMonth = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Anio, Mes } = req.query;
        const sessionId = req.sessionID

        if (typeof Anio !== 'string') {
            throw new BadRequestError({ code: 500, message: `No se envio un Año correcto`, logging: true });
        }

        if (typeof Mes !== 'string') {
            throw new BadRequestError({ code: 500, message: `No se envio un Mes correcto`, logging: true });
        }

        const tasks = await getCalendarTaskByMonthService({
            sessionId,
            Anio,
            Mes
        })
        res.json(tasks);
    } catch (error) {
        next(error)
    };

};

const getCalendarTaskByDay = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Day} = req.query;
        const sessionId = req.sessionID

        if (typeof Day !== 'string') {
            throw new BadRequestError({ code: 500, message: `No se envio un Dia correcto`, logging: true });
        }

        const tasks = await getCalendarTaskByDayService({
            sessionId,
            Day
        });

        res.json(tasks);
    } catch (error) {
        next(error)
    };

};

export{
    getCalendarTaskByMonth,
    getCalendarTaskByDay
}