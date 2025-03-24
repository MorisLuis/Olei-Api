import { NextFunction, Request, Response } from "express";
import { getCalendarTaskByDayService, getCalendarTaskByMonthAndClientService, getCalendarTaskByMonthService } from "../services/calendarService";
import { getCalendarByMonthAndClientQuerySchema, getCalendarTaskByDayQuerySchema, getCalendarTaskByMonthQuerySchema } from "../validations/calendarValidations";
import { z } from "zod";


const getCalendarTaskByMonth = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
    
    try {
        const { Anio, Mes } = getCalendarTaskByMonthQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const tasks = await getCalendarTaskByMonthService({
            userSession,
            Anio,
            Mes,
        });

        return res.json(tasks);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    }
};

const getCalendarTaskByDay = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {

    /* Timeline */
    try {
        const { Day } = getCalendarTaskByDayQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;

        const tasks = await getCalendarTaskByDayService({
            userSession,
            Day
        });

        res.json(tasks);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    };

};

const getCalendarTaskByMonthAndClient = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {

    try {
        const { Anio, Mes, Id_Cliente } = getCalendarByMonthAndClientQuerySchema.parse(req.query);
        const userSession = req.sessionWeb

        const tasks = await getCalendarTaskByMonthAndClientService({
            userSession,
            Anio,
            Mes,
            Id_Cliente
        });

        return res.json(tasks);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            return next(error);
        }
    };

};


export {
    getCalendarTaskByMonth,
    getCalendarTaskByDay,
    getCalendarTaskByMonthAndClient
}