"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeetingService = exports.postMeetingService = exports.updateMeetingService = exports.getMeetingByIdService = exports.getMeetingsService = void 0;
const database_1 = require("../database");
const bitacora_1 = require("../database/querys/bitacora");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const meeting_1 = require("../interface/meeting");
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const getMeetingsService = async ({ sessionId, PageNumber, Id_Cliente, TipoContacto, MeetingOrderCondition, MeetingFilterCondition }) => {
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
    let query = bitacora_1.bitacoraQuerys.getMeetings;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('OrderCondition', MeetingOrderCondition)
        .input('WhereCondition', MeetingFilterCondition)
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getMeetingsService = getMeetingsService;
const getMeetingByIdService = async (id, sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR) {
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    ;
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
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
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    if (!id) {
        throw new BadRequestError_1.default({ code: 500, message: 'No se adjunto un Id_Bitacora valido o existente', logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    //START TRANSACTION
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    let { Id_Cliente, Descripcion, TipoContacto, Fecha } = body;
    if (!meeting_1.validTipoContacto.includes(TipoContacto)) {
        throw new BadRequestError_1.default({ code: 500, message: `No es valido el tipo de contacto`, logging: true });
    }
    ;
    if (!Id_Cliente) {
        throw new BadRequestError_1.default({ code: 500, message: 'Es necesario el id de el cliente', logging: true });
    }
    const request = new mssql_1.default.Request(transaction)
        .input('Id_Bitacora', id)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('Descripcion', mssql_1.default.VarChar, Descripcion)
        .input('TipoContacto', mssql_1.default.Int, TipoContacto)
        .input('Fecha', mssql_1.default.Date, Fecha);
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
        throw new BadRequestError_1.default({ code: 401, message: "Sesion terminada", logging: true });
    }
    const { Serverweb, Baseweb } = userFR;
    const pool = await (0, database_1.dbConnection)(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError_1.default({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    }
    ;
    //START TRANSACTION
    const transaction = new mssql_1.default.Transaction(pool);
    await transaction.begin();
    const request = new mssql_1.default.Request(transaction);
    const query = bitacora_1.bitacoraQuerys.insertMeeting;
    const { Fecha, Descripcion, TipoContacto, Id_Cliente } = body;
    const { Id_Almacen } = userFR;
    if (!meeting_1.validTipoContacto.includes(TipoContacto)) {
        throw new BadRequestError_1.default({ code: 500, message: `No es valido el tipo de contacto`, logging: true });
    }
    ;
    if (!Id_Cliente) {
        throw new BadRequestError_1.default({ code: 500, message: 'Es necesario el id de el cliente', logging: true });
    }
    const result = await request
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen ?? 0)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('Fecha', mssql_1.default.Date, Fecha)
        .input('Descripcion', mssql_1.default.VarChar, Descripcion)
        .input('TipoContacto', mssql_1.default.Int, TipoContacto)
        .query(query);
    await transaction.commit();
    //END TRANSACTION
    return { result: result.recordset[0] };
};
exports.postMeetingService = postMeetingService;
const deleteMeetingService = async (id, sessionId) => {
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