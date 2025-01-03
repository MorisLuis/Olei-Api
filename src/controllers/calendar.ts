import { NextFunction, Request, Response } from "express";
import { getCalendarTaskByDayService, getCalendarTaskByMonthAndClientService, getCalendarTaskByMonthService } from "../services/calendarService";
import { getCalendarByMonthAndClientQuerySchema, getCalendarTaskByDayQuerySchema, getCalendarTaskByMonthQuerySchema } from "../validations/calendarValidations";
import { z } from "zod";


const getCalendarTaskByMonth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Anio, Mes } = getCalendarTaskByMonthQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const tasks = await getCalendarTaskByMonthService({
            sessionId,
            Anio,
            Mes,
        });

        res.json(tasks);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    }
};

const getCalendarTaskByDay = async (req: Request, res: Response, next: NextFunction) => {

    /* Timeline */
    try {
        const { Day } = getCalendarTaskByDayQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;

        const tasks = await getCalendarTaskByDayService({
            sessionId,
            Day
        });

        res.json(tasks);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
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
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        } else {
            next(error);
        }
    };

};


export {
    getCalendarTaskByMonth,
    getCalendarTaskByDay,
    getCalendarTaskByMonthAndClient
}