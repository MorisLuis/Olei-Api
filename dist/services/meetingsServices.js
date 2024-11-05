"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeetingService = exports.postMeetingService = exports.updateMeetingService = exports.getMeetingByIdService = exports.getMeetingsService = void 0;
const database_1 = require("../database");
const bitacora_1 = require("../database/querys/bitacora");
const BadRequestError_1 = __importDefault(require("../errors/BadRequestError"));
const getSession_1 = require("../utils/Redis/getSession");
const mssql_1 = __importDefault(require("mssql"));
const getMeetingsService = async (PageNumber, sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
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
        .query(query);
    const quotes = request.recordset;
    return quotes;
};
exports.getMeetingsService = getMeetingsService;
const getMeetingByIdService = async (id, sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
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
    if (!userFR)
        throw new Error('Sesion terminada');
    if (!id)
        throw new Error('No se adjunto un Id_Bitacora valido o existente');
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
    const request = new mssql_1.default.Request(transaction)
        .input('Id_Bitacora', id)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('Descripcion', mssql_1.default.VarChar, Descripcion)
        .input('TipoContacto', mssql_1.default.Int, TipoContacto)
        .input('Fecha', mssql_1.default.Date, Fecha);
    const query = bitacora_1.bitacoraQuerys.updateMeeting;
    await request.query(query);
    await transaction.commit();
    // END TRANSACTION
    return { ok: true };
};
exports.updateMeetingService = updateMeetingService;
const postMeetingService = async (sessionId, body) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
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
    const { Fecha, Descripcion, TipoContacto } = body;
    const { Id_Almacen, Id_Cliente } = userFR;
    const result = await request
        .input('Id_Almacen', mssql_1.default.Int, Id_Almacen ?? 0)
        .input('Id_Cliente', mssql_1.default.Int, Id_Cliente)
        .input('Fecha', mssql_1.default.Date, Fecha)
        .input('Descripcion', mssql_1.default.VarChar, Descripcion)
        .input('TipoContacto', mssql_1.default.Int, TipoContacto)
        .query(query);
    await transaction.commit();
    //END TRANSACTION
    return { ok: true };
};
exports.postMeetingService = postMeetingService;
const deleteMeetingService = async (id, sessionId) => {
    const { user: userFR } = await (0, getSession_1.handleGetWebSession)({ sessionId });
    if (!userFR)
        throw new Error('Sesion terminada');
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
    return id;
};
exports.deleteMeetingService = deleteMeetingService;
//# sourceMappingURL=meetingsServices.js.map