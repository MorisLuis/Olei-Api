"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByDayService = exports.getCalendarTaskByMonthService = void 0;
const database_1 = require("../database");
const calendar_1 = require("../database/querys/calendar");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const getCalendarTaskByMonthService = async ({ sessionId, Mes, Anio }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = calendar_1.celendarQuerys.getCalendarTasksMonth;
    const request = await pool.request()
        .input('Anio', Anio)
        .input('Mes', Mes)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getCalendarTaskByMonthService = getCalendarTaskByMonthService;
const getCalendarTaskByDayService = async ({ sessionId, Day }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    let query = calendar_1.celendarQuerys.getCalendarTasksDay;
    const request = await pool.request()
        .input('FechaEspecifica', Day)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getCalendarTaskByDayService = getCalendarTaskByDayService;
//# sourceMappingURL=calendarService.js.map