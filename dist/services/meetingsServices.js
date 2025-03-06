"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeetingService = exports.postMeetingService = exports.updateMeetingService = exports.getMeetingByIdService = exports.getTotalMeetingsService = exports.getMeetingsService = void 0;
const database_1 = require("../database");
const bitacora_1 = require("../database/querys/bitacora");
const CustomError_1 = require("../errors/CustomError");
const meeting_1 = require("../interface/meeting");
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const getMeetingsService = async ({ sessionId, PageNumber, Id_Cliente, TipoContacto, MeetingOrderCondition, FilterCliente, FilterTipoContacto }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    if (FilterCliente === 1 && !Id_Cliente) {
        throw new CustomError_1.ValidationError('Es necesario un Id_Cliente.');
    }
    ;
    if (FilterTipoContacto === 1 && !TipoContacto) {
        throw new CustomError_1.ValidationError('Es necesario un TipoContacto.');
    }
    let query = bitacora_1.bitacoraQuerys.getMeetings;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('OrderCondition', MeetingOrderCondition)
        .input('FilterTipoContacto', FilterTipoContacto)
        .input('FilterCliente', FilterCliente)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getMeetingsService = getMeetingsService;
;
const getTotalMeetingsService = async ({ sessionId, Id_Cliente, TipoContacto, FilterCliente, FilterTipoContacto }) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    if (FilterCliente === 1 && !Id_Cliente) {
        throw new CustomError_1.ValidationError('Es necesario un Id_Cliente.');
    }
    ;
    if (FilterTipoContacto === 1 && !TipoContacto) {
        throw new CustomError_1.ValidationError('Es necesario un TipoContacto.');
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = bitacora_1.bitacoraQuerys.getTotalMeetings;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('FilterCliente', FilterCliente)
        .input('FilterTipoContacto', FilterTipoContacto)
        .query(query);
    const total = request.recordset[0].TotalCount;
    return total;
};
exports.getTotalMeetingsService = getTotalMeetingsService;
const getMeetingByIdService = async (id, sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    let query = bitacora_1.bitacoraQuerys.getMeetingById;
    const request = await pool.request()
        .input('Id_Bitacora', id)
        .query(query);
    const quotes = request.recordset[0];
    return quotes;
};
exports.getMeetingByIdService = getMeetingByIdService;
const updateMeetingService = async (id, sessionId, body) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    if (!id) {
        throw new CustomError_1.ValidationError('No se adjunto un Id_Bitacora valido o existente.');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    //START TRANSACTION
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    const { Fecha, Hour, HourEnd, Titulo, Descripcion, TipoContacto, Comentarios } = body;
    if (TipoContacto && !meeting_1.validTipoContacto.includes(TipoContacto)) {
        throw new CustomError_1.ValidationError('No es valido el tipo de contacto');
    }
    ;
    const request = new mssql_1.default.Request(transaction)
        .input('Id_Bitacora', mssql_1.default.Int, id)
        .input('Fecha', mssql_1.default.Date, Fecha)
        .input('Hour', mssql_1.default.VarChar, Hour)
        .input('HourEnd', mssql_1.default.VarChar, HourEnd)
        .input('Titulo', mssql_1.default.VarChar, Titulo)
        .input('Descripcion', mssql_1.default.VarChar, Descripcion)
        .input('TipoContacto', mssql_1.default.Int, TipoContacto)
        .input('Comentarios', mssql_1.default.VarChar, Comentarios);
    const query = bitacora_1.bitacoraQuerys.updateMeeting;
    const result = await request.query(query);
    await transaction.commit();
    // END TRANSACTION
    return { result: result.recordset[0] };
};
exports.updateMeetingService = updateMeetingService;
const postMeetingService = async (sessionId, body) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    //START TRANSACTION
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    const request = new mssql_1.default.Request(transaction);
    const query = bitacora_1.bitacoraQuerys.insertMeeting;
    const { Id_Almacen, Id_Cliente, Fecha, Hour, HourEnd, Titulo, Descripcion, TipoContacto, Comentarios } = body;
    if (!meeting_1.validTipoContacto.includes(TipoContacto)) {
        throw new CustomError_1.ValidationError('No es valido el tipo de contacto');
    }
    ;
    if (!Id_Cliente) {
        throw new CustomError_1.ValidationError('Es necesario el id de el cliente');
    }
    const result = await request
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen ?? 0)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('Fecha', mssql_1.default.Date, Fecha)
        .input('Hour', mssql_1.default.VarChar, Hour)
        .input('HourEnd', mssql_1.default.VarChar, HourEnd)
        .input('Titulo', mssql_1.default.VarChar, Titulo)
        .input('Descripcion', mssql_1.default.VarChar, Descripcion)
        .input('TipoContacto', mssql_1.default.Int, TipoContacto)
        .input('Comentarios', mssql_1.default.VarChar, Comentarios)
        .query(query);
    await transaction.commit();
    //END TRANSACTION
    return { result: result.recordset[0] };
};
exports.postMeetingService = postMeetingService;
const deleteMeetingService = async (id, sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new CustomError_1.UnauthorizedError('Sesion terminada');
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    //START TRANSACTION
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    const request = new mssql_1.default.Request(transaction);
    const query = bitacora_1.bitacoraQuerys.deleteMeeting;
    const result = await request
        .input('Id_Bitacora', mssql_1.default.Int, id)
        .query(query);
    await transaction.commit();
    //END TRANSACTION
    return { result: result.recordset[0] };
};
exports.deleteMeetingService = deleteMeetingService;
//# sourceMappingURL=meetingsServices.js.map