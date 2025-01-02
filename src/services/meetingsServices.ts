import { dbConnection } from "../database";
import { bitacoraQuerys } from "../database/querys/bitacora";
import BadRequestError from "../errors/BadRequestError";
import MeetingInterface, { MeetingOrderConditionType, validTipoContacto } from "../interface/meeting";
import { handleGetWebSession } from "../utils/Redis/getSession";
import sql from 'mssql';

interface getMeetingsServiceInterface {
    sessionId: string,
    PageNumber: number,
    Id_Cliente: number,
    TipoContacto: number,
    MeetingOrderCondition: MeetingOrderConditionType | string,
    FilterCliente: 0 | 1,
    FilterTipoContacto: 0 | 1,
}

const getMeetingsService = async ({
    sessionId,
    PageNumber,
    Id_Cliente,
    TipoContacto,
    MeetingOrderCondition,
    FilterCliente,
    FilterTipoContacto
}: getMeetingsServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    if (FilterCliente === 1 && !Id_Cliente) {
        throw new BadRequestError({ code: 500, message: `Es necesario un Id_Cliente.`, logging: true });
    };

    if (FilterTipoContacto === 1 && !TipoContacto) {
        throw new BadRequestError({ code: 500, message: `Es necesario un TipoContacto.`, logging: true });
    }

    let query = bitacoraQuerys.getMeetings;
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


    return quotes
};


interface getTotalMeetingsServiceInterface {
    sessionId: string,
    Id_Cliente: number,
    TipoContacto: number,
    FilterCliente: 0 | 1,
    FilterTipoContacto: 0 | 1
};

const getTotalMeetingsService = async ({
    sessionId,
    Id_Cliente,
    TipoContacto,
    FilterCliente,
    FilterTipoContacto
}: getTotalMeetingsServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new BadRequestError({ code: 401, message: "Sesion terminada", logging: true });
    }

    if (FilterCliente === 1 && !Id_Cliente) {
        throw new BadRequestError({ code: 500, message: `Es necesario un Id_Cliente.`, logging: true });
    };

    if (FilterTipoContacto === 1 && !TipoContacto) {
        throw new BadRequestError({ code: 500, message: `Es necesario un TipoContacto.`, logging: true });
    };

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

    if (!pool) {
        throw new BadRequestError({ code: 500, message: `No se pudo establecer la conexión con la base de datos.`, logging: true });
    };

    let query = bitacoraQuerys.getTotalMeetings;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('FilterCliente', FilterCliente)
        .input('FilterTipoContacto', FilterTipoContacto)
        .query(query);

    const total = request.recordset[0].TotalCount

    return total
};


const getMeetingByIdService = async (id: number, sessionId: string) => {
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

const updateMeetingService = async (id: number, sessionId: string, body: MeetingInterface) => {

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

    const {
        Fecha,
        Hour,
        HourEnd,
        Titulo,
        Descripcion,
        TipoContacto,
        Comentarios
    } = body;
    if (TipoContacto && !validTipoContacto.includes(TipoContacto)) {
        throw new BadRequestError({ code: 500, message: `No es valido el tipo de contacto`, logging: true });
    };

    const request = new sql.Request(transaction)
        .input('Id_Bitacora', sql.Int, id)
        .input('Fecha', sql.Date, Fecha)
        .input('Hour', sql.VarChar, Hour)
        .input('HourEnd', sql.VarChar, HourEnd)
        .input('Titulo', sql.VarChar, Titulo)
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('TipoContacto', sql.Int, TipoContacto)
        .input('Comentarios', sql.VarChar, Comentarios)

    const query = bitacoraQuerys.updateMeeting;
    const result = await request.query(query);
    await transaction.commit();
    // END TRANSACTION

    return { result: result.recordset[0] }

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

    const {
        Id_Almacen,
        Id_Cliente,
        Fecha,
        Hour,
        HourEnd,
        Titulo,
        Descripcion,
        TipoContacto,
        Comentarios
    } = body;

    if (!validTipoContacto.includes(TipoContacto)) {
        throw new BadRequestError({ code: 500, message: `No es valido el tipo de contacto`, logging: true });
    };

    if (!Id_Cliente) {
        throw new BadRequestError({ code: 500, message: 'Es necesario el id de el cliente', logging: true });
    }

    const result = await request
        .input('Id_Almacen', sql.Int, Id_Almacen ?? 0)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('Fecha', sql.Date, Fecha)
        .input('Hour', sql.VarChar, Hour)
        .input('HourEnd', sql.VarChar, HourEnd)
        .input('Titulo', sql.VarChar, Titulo)
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('TipoContacto', sql.Int, TipoContacto)
        .input('Comentarios', sql.VarChar, Comentarios)
        .query(query);

    await transaction.commit();
    //END TRANSACTION

    return { result: result.recordset[0] }
};

const deleteMeetingService = async (id: number, sessionId: string) => {

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
    return { result: result.recordset[0] }
}

export {
    getMeetingsService,
    getTotalMeetingsService,
    getMeetingByIdService,
    updateMeetingService,
    postMeetingService,
    deleteMeetingService
}