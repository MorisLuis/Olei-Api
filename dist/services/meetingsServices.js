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
const mssql_1 = __importDefault(require("mssql"));
const getMeetingsService = async ({ userSession, PageNumber, Id_Cliente, TipoContacto, MeetingOrderCondition, FilterCliente, searchTerm }) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new CustomError_1.ValidationError('Error al conectarse a base de datos principal');
    }
    ;
    if (FilterCliente === 1 && !Id_Cliente) {
        throw new CustomError_1.ValidationError('Es necesario un Id_Cliente.');
    }
    ;
    const query = bitacora_1.bitacoraQuerys.getMeetings;
    const totalMeetingsQuery = bitacora_1.bitacoraQuerys.getTotalMeetings;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('OrderCondition', MeetingOrderCondition)
        .input('FilterTipoContacto', TipoContacto === 0 ? 0 : 1)
        .input('FilterCliente', FilterCliente)
        .input('searchTerm', searchTerm)
        .query(query);
    const requestTotal = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('FilterTipoContacto', TipoContacto === 0 ? 0 : 1)
        .input('FilterCliente', FilterCliente)
        .input('searchTerm', searchTerm)
        .query(totalMeetingsQuery);
    const [meetingsResult, totalResult] = await Promise.all([
        request,
        requestTotal
    ]);
    return {
        meetings: meetingsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    };
};
exports.getMeetingsService = getMeetingsService;
;
const getTotalMeetingsService = async ({ userSession, Id_Cliente, TipoContacto, FilterCliente, FilterTipoContacto }) => {
    if (FilterCliente === 1 && !Id_Cliente) {
        throw new CustomError_1.ValidationError('Es necesario un Id_Cliente.');
    }
    ;
    if (FilterTipoContacto === 1 && !TipoContacto) {
        throw new CustomError_1.ValidationError('Es necesario un TipoContacto.');
    }
    ;
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
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
const getMeetingByIdService = async (id, userSession) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
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
const updateMeetingService = async (id, userSession, body) => {
    if (!id) {
        throw new CustomError_1.ValidationError('No se adjunto un Id_Bitacora valido o existente.');
    }
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
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
const postMeetingService = async (userSession, body) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
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
const deleteMeetingService = async (id, userSession) => {
    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await (0, database_1.dbConnectionWeb)(ServidorSQL, BaseSQL);
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