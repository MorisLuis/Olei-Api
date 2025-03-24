import { dbConnectionWeb } from "../database";
import { clientsQuerys } from "../database/querys/clients";
import { ValidationError } from "../errors/CustomError";
import { ClientInterface } from "../interface/client";
import { UserWebSessionInterface } from "../interface/user";
import sql from 'mssql';

interface getClientsServiceInterface {
    PageNumber: number,
    userSession: UserWebSessionInterface,
    OrderCondition: string
};

const getClientsService = async ({
    PageNumber,
    userSession,
    OrderCondition
}: getClientsServiceInterface): Promise<ClientInterface[]> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getClients;
    const request = await pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('OrderCondition', OrderCondition)
        .query(query);

    const quotes = request.recordset

    return quotes
};

interface getClientIdInterface {
    userSession: UserWebSessionInterface,
    Id_Cliente: number,
    Id_Almacen: number
};

const getClientIdService = async ({
    userSession,
    Id_Cliente,
    Id_Almacen
}: getClientIdInterface): Promise<ClientInterface> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getClientId;
    const request = await pool.request()
        .input('Id_Cliente', Id_Cliente)
        .input('Id_Almacen', Id_Almacen)
        .query(query);
    const quotes = request.recordset[0]
    return quotes
};

const getTotalClientsService = async (userSession: UserWebSessionInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getTotalClients;
    const request = await pool.request()
        .query(query);

    const total = request.recordset[0].TotalCount
    return total
};

interface searchClientServiceInterface {
    userSession: UserWebSessionInterface;
    term: string
};

const searchClientService = async ({
    userSession,
    term
}: searchClientServiceInterface): Promise<{ Clients: ClientInterface[] }> => {


    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getClientBySearch;
    const result = await pool.request()
        .input('nombre', sql.VarChar, term)
        .query(query);

    const Clients = result.recordset;

    return {
        Clients
    }
}

export {
    getClientsService,
    getClientIdService,
    getTotalClientsService,
    searchClientService
}