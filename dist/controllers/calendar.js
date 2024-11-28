"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByDay = exports.getCalendarTaskByMonth = void 0;
const calendarService_1 = require("../services/calendarService");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getCalendarTaskByMonth = async (req, res, next) => {
    try {
        const { Anio, Mes } = req.query;
        const sessionId = req.sessionID;
        if (typeof Anio !== 'string') {
            throw new BadRequestError_1.default({ code: 500, message: `No se envio un Año correcto`, logging: true });
        }
        if (typeof Mes !== 'string') {
            throw new BadRequestError_1.default({ code: 500, message: `No se envio un Mes correcto`, logging: true });
        }
        const tasks = await (0, calendarService_1.getCalendarTaskByMonthService)({
            sessionId,
            Anio,
            Mes
        });
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getCalendarTaskByMonth = getCalendarTaskByMonth;
const getCalendarTaskByDay = async (req, res, next) => {
    try {
        const { Day } = req.query;
        const sessionId = req.sessionID;
        if (typeof Day !== 'string') {
            throw new BadRequestError_1.default({ code: 500, message: `No se envio un Dia correcto`, logging: true });
        }
        const tasks = await (0, calendarService_1.getCalendarTaskByDayService)({
            sessionId,
            Day
        });
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
    ;
};
exports.getCalendarTaskByDay = getCalendarTaskByDay;
//# sourceMappingURL=calendar.js.map