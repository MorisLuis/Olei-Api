"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByMonthAndClient = exports.getCalendarTaskByDay = exports.getCalendarTaskByMonth = void 0;
const calendarService_1 = require("../services/calendarService");
const calendarValidations_1 = require("../validations/calendarValidations");
const getCalendarTaskByMonth = async (req, res, next) => {
    try {
        const { Anio, Mes } = calendarValidations_1.getCalendarTaskByMonthQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const tasks = await (0, calendarService_1.getCalendarTaskByMonthService)({
            userSession,
            Anio,
            Mes,
        });
        return res.json({
            tasks
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCalendarTaskByMonth = getCalendarTaskByMonth;
const getCalendarTaskByDay = async (req, res, next) => {
    /* Timeline */
    try {
        const { Day } = calendarValidations_1.getCalendarTaskByDayQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const tasks = await (0, calendarService_1.getCalendarTaskByDayService)({
            userSession,
            Day
        });
        res.json({
            tasks
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCalendarTaskByDay = getCalendarTaskByDay;
const getCalendarTaskByMonthAndClient = async (req, res, next) => {
    try {
        const { Anio, Mes, Id_Cliente } = calendarValidations_1.getCalendarByMonthAndClientQuerySchema.parse(req.query);
        const userSession = req.sessionWeb;
        const tasks = await (0, calendarService_1.getCalendarTaskByMonthAndClientService)({
            userSession,
            Anio,
            Mes,
            Id_Cliente
        });
        return res.json({
            tasks
        });
    }
    catch (error) {
        return next(error);
    }
    ;
};
exports.getCalendarTaskByMonthAndClient = getCalendarTaskByMonthAndClient;
//# sourceMappingURL=calendar.js.map