"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTaskByDayAndClientService = void 0;
const database_1 = require("../../database");
const calendar_1 = require("../../database/querys/calendar");
const CustomError_1 = require("../../errors/CustomError");
const getCalendarTaskByDayAndClientService = async ({ userSession, Day, Id_Cliente, PageNumber, limit }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = calendar_1.celendarQuerys.getCalendarTasksByDay;
    const request = await pool.request()
        .input('FechaEspecifica', Day)
        .input('Id_Cliente', Id_Cliente)
        .input('Page', PageNumber)
        .input('limit', limit)
        .query(query);
    const quotes = request.recordset;
    const TotalBitacora = request.recordsets[1][0].TotalBitacora;
    const TotalVentas = request.recordsets[2][0].TotalVentas;
    return {
        quotes,
        TotalBitacora,
        TotalVentas
    };
};
exports.getCalendarTaskByDayAndClientService = getCalendarTaskByDayAndClientService;
//# sourceMappingURL=getAllTasksByDay.js.map