import { NextFunction, Request, Response } from "express";
import { getCalendarTaskByDayService, getCalendarTaskByMonthAndClientService, getCalendarTaskByMonthService } from "../services/calendarService";
import BadRequestError from "../errors/BadRequestError";
import { getCalendarByMonthAndClientQuerySchema } from "../validations/calendarValidations";


const getCalendarTaskByMonth = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Anio, Mes } = req.query;
        const sessionId = req.sessionRedis

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
        const { Day } = req.query;
        const sessionId = req.sessionRedis

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

const getCalendarTaskByMonthAndClient = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { Anio, Mes, Id_Cliente } = getCalendarByMonthAndClientQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis

        const tasks = await getCalendarTaskByMonthAndClientService({
            sessionId,
            Anio,
            Mes,
            Id_Cliente
        });

        res.json(tasks);
    } catch (error) {
        next(error)
    };

};


export {
    getCalendarTaskByMonth,
    getCalendarTaskByDay,
    getCalendarTaskByMonthAndClient
}