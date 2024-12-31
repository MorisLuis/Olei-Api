"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByMonthAndClient = exports.getCalendarTaskByDay = exports.getCalendarTaskByMonth = void 0;
const calendarService_1 = require("../services/calendarService");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const calendarValidations_1 = require("../validations/calendarValidations");
const getCalendarTaskByMonth = async (req, res, next) => {
    try {
        const { Anio, Mes } = req.query;
        const sessionId = req.sessionRedis;
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
        const sessionId = req.sessionRedis;
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
        next(error);
    }
    ;
};
exports.getCalendarTaskByMonthAndClient = getCalendarTaskByMonthAndClient;
//# sourceMappingURL=calendar.js.map