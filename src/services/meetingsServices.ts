import { dbConnectionWeb } from "../database";
import { bitacoraQuerys } from "../database/querys/bitacora";
import { ValidationError } from "../errors/CustomError";
import type { MeetingOrderConditionType } from "../interface/meeting";
import type MeetingInterface from "../interface/meeting";
import { validTipoContacto } from "../interface/meeting";
import type { UserWebSessionInterface } from "../interface/user";
import sql from 'mssql';

interface getMeetingsServiceInterface {
    userSession: UserWebSessionInterface,
    PageNumber: number,
    Id_Cliente: number,
    TipoContacto: number,
    MeetingOrderCondition: MeetingOrderConditionType | string,
    FilterCliente: 0 | 1,
    searchTerm?: string
    status: number
}

const getMeetingsService = async ({
    userSession,
    PageNumber,
    Id_Cliente,
    TipoContacto,
    MeetingOrderCondition,
    FilterCliente,
    searchTerm,
    status = 0
}: getMeetingsServiceInterface): Promise<{ meetings: MeetingInterface[], total: number }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    if (FilterCliente === 1 && !Id_Cliente) {
        throw new ValidationError('Es necesario un Id_Cliente.')
    };


    const query = bitacoraQuerys.getMeetings;
    const totalMeetingsQuery = bitacoraQuerys.getTotalMeetings;

    // Adjust status for query, we have to adapted to frontend logic temporarily
    const validStatus = status === 0 ? -1 : status === 1 ? 0 : status === 2 ? 1 : 0;

    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('OrderCondition', MeetingOrderCondition)
        .input('FilterTipoContacto', TipoContacto === 0 ? 0 : 1)
        .input('FilterCliente', FilterCliente)
        .input('searchTerm', searchTerm)
        .input('status', validStatus)
        .query(query);

    const requestTotal = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('TipoContacto', TipoContacto)
        .input('FilterTipoContacto', TipoContacto === 0 ? 0 : 1)
        .input('FilterCliente', FilterCliente)
        .input('searchTerm', searchTerm)
        .input('status', validStatus)
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


interface getTotalMeetingsServiceInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    TipoContacto: number,
    FilterCliente: 0 | 1,
    FilterTipoContacto: 0 | 1
};

const getTotalMeetingsService = async ({
    userSession,
    Id_Cliente,
    TipoContacto,
    FilterCliente,
    FilterTipoContacto
}: getTotalMeetingsServiceInterface): Promise<number> => {

    if (FilterCliente === 1 && !Id_Cliente) {
        throw new ValidationError('Es necesario un Id_Cliente.')

    };

    if (FilterTipoContacto === 1 && !TipoContacto) {
        throw new ValidationError('Es necesario un TipoContacto.')
    };

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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


const getMeetingByIdService = async (id: number, userSession: UserWebSessionInterface): Promise<MeetingInterface> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = bitacoraQuerys.getMeetingById;
    const request = await pool.request()
        .input('Id_Bitacora', id)
        .query(query);


    const quotes = request.recordset[0]

    return quotes
}

const updateMeetingService = async (
    id: number,
    userSession: UserWebSessionInterface,
    body: MeetingInterface
): Promise<{ result: MeetingInterface }> => {

    if (!id) {
        throw new ValidationError('No se adjunto un Id_Bitacora valido o existente.');
    }

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    //START TRANSACTION
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const {
        Fecha,
        Hour,
        HourEnd,
        Descripcion,
        TipoContacto,
        Comentarios,
        status
    } = body;

    if (TipoContacto && !validTipoContacto.includes(TipoContacto)) {
        throw new ValidationError('No es valido el tipo de contacto');
    };

    const request = new sql.Request(transaction)
        .input('Id_Bitacora', sql.Int, id)
        .input('Fecha', sql.Date, Fecha)
        .input('Hour', sql.VarChar, Hour)
        .input('HourEnd', sql.VarChar, HourEnd)
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('TipoContacto', sql.Int, TipoContacto)
        .input('Comentarios', sql.VarChar, Comentarios)
        .input('status', sql.Bit, status);

    const query = bitacoraQuerys.updateMeeting;
    const result = await request.query(query);
    await transaction.commit();
    // END TRANSACTION

    return { result: result.recordset[0] }

};

const postMeetingService = async (userSession: UserWebSessionInterface, body: MeetingInterface): Promise<{ result: MeetingInterface }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };
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
        Descripcion,
        TipoContacto,
        Comentarios
    } = body;

    if (!validTipoContacto.includes(TipoContacto)) {
        throw new ValidationError('No es valido el tipo de contacto')
    };

    if (!Id_Cliente) {
        throw new ValidationError('Es necesario el id de el cliente')
    }

    const result = await request
        .input('Id_Almacen', sql.Int, Id_Almacen ?? 0)
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('Fecha', sql.Date, Fecha)
        .input('Hour', sql.VarChar, Hour)
        .input('HourEnd', sql.VarChar, HourEnd)
        .input('Descripcion', sql.VarChar, Descripcion)
        .input('TipoContacto', sql.Int, TipoContacto)
        .input('Comentarios', sql.VarChar, Comentarios)
        .input('status', sql.Bit, 1)
        .query(query);

    await transaction.commit();
    //END TRANSACTION

    return { result: result.recordset[0] }
};

const deleteMeetingService = async (id: number, userSession: UserWebSessionInterface): Promise<{ result: MeetingInterface }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
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