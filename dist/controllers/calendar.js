"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByMonthAndClient = exports.getCalendarTaskByDay = exports.getCalendarTaskByMonth = void 0;
const calendarService_1 = require("../services/calendarService");
const calendarValidations_1 = require("../validations/calendarValidations");
const zod_1 = require("zod");
const getCalendarTaskByMonth = async (req, res, next) => {
    try {
        const { Anio, Mes } = calendarValidations_1.getCalendarTaskByMonthQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const tasks = await (0, calendarService_1.getCalendarTaskByMonthService)({
            sessionId,
            Anio,
            Mes,
        });
        res.json(tasks);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
};
exports.getCalendarTaskByMonth = getCalendarTaskByMonth;
const getCalendarTaskByDay = async (req, res, next) => {
    /* Timeline */
    try {
        const { Day } = calendarValidations_1.getCalendarTaskByDayQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const tasks = await (0, calendarService_1.getCalendarTaskByDayService)({
            sessionId,
            Day
        });
        res.json(tasks);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
    ;
};
exports.getCalendarTaskByDay = getCalendarTaskByDay;
const getCalendarTaskByMonthAndClient = async (req, res, next) => {
    try {
        const { Anio, Mes, Id_Cliente } = calendarValidations_1.getCalendarByMonthAndClientQuerySchema.parse(req.query);
        const sessionId = req.sessionRedis;
        const tasks = await (0, calendarService_1.getCalendarTaskByMonthAndClientService)({
            sessionId,
            Anio,
            Mes,
            Id_Cliente
        });
        res.json(tasks);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        else {
            next(error);
        }
    }
    ;
};
exports.getCalendarTaskByMonthAndClient = getCalendarTaskByMonthAndClient;
//# sourceMappingURL=calendar.js.map