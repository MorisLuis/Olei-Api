"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByMonthAndClientService = exports.getCalendarTaskByDayService = exports.getCalendarTaskByMonthService = void 0;
const database_1 = require("../database");
const calendar_1 = require("../database/querys/calendar");
const CustomError_1 = require("../errors/CustomError");
const getSession_1 = require("../utils/Redis/getSession");
const getCalendarTaskByMonthService = async ({ sessionId, Mes, Anio }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
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
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
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
const getCalendarTaskByMonthAndClientService = async ({ sessionId, Mes, Anio, Id_Cliente }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnectionWeb)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = calendar_1.celendarQuerys.getCalendarTasksMonthByClient;
    const request = await pool.request()
        .input('Anio', Anio)
        .input('Mes', Mes)
        .input('Id_Cliente', Id_Cliente)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getCalendarTaskByMonthAndClientService = getCalendarTaskByMonthAndClientService;
//# sourceMappingURL=calendarService.js.map