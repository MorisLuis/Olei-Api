import { dbConnection } from "../database";
import { bitacoraQuerys } from "../database/querys/bitacora";
import BadRequestError from "../errors/BadRequestError";
import MeetingInterface from "../interface/meeting";
import { handleGetWebSession } from "../utils/Redis/getSession";
import sql from 'mssql';

const getMeetingsService = async (PageNumber: string, sessionId: string) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = bitacoraQuerys.getMeetings;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .query(query);

    const quotes = request.recordset

    return quotes
};

const getMeetingByIdService = async (id: string, sessionId: string) => {
    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    };

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = bitacoraQuerys.getMeetingById;
    const request = await pool.request()
        .input('Id_Bitacora', id)
        .query(query);

    const quotes = request.recordset[0]

    return quotes
}

const updateMeetingService = async (id: string, sessionId: string, body: MeetingInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    if (!id) {
        throw new BadRequestError({ code: 500, message: 'No se adjunto un Id_Bitacora valido o existente', logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    //START TRANSACTION
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let { Id_Cliente, Descripcion, TipoContacto, Fecha } = body;

    const request = new sql.Request(transaction)
        .input('Id_Bitacora', id)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('TipoContacto', sql.Int, TipoContacto)
        .input('Fecha', sql.Date, Fecha);

    const query = bitacoraQuerys.updateMeeting;
    await request.query(query);
    await transaction.commit();
    // END TRANSACTION

    return { ok: true }

};

const postMeetingService = async (sessionId: string, body: MeetingInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    //START TRANSACTION
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    const query = bitacoraQuerys.insertMeeting;

    const { Fecha, Descripcion, TipoContacto } = body;
    const { Id_Almacen, Id_Cliente } = userFR;

    const result = await request
        .input('Id_Almacen', sql.Int, Id_Almacen ?? 0)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('Fecha', sql.Date, Fecha)
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('TipoContacto', sql.Int, TipoContacto)
        .query(query);

    await transaction.commit();
    //END TRANSACTION

    return { ok: true }
};

const deleteMeetingService = async (id: string, sessionId: string) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    //START TRANSACTION
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    const query = bitacoraQuerys.deleteMeeting;
    const result = await request
        .input('Id_Bitacora', sql.Int, id)
        .query(query);

    await transaction.commit();
    //END TRANSACTION

    return id;
}

export {
    getMeetingsService,
    getMeetingByIdService,
    updateMeetingService,
    postMeetingService,
    deleteMeetingService
}