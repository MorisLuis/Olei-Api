import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { ClientInterface } from "../../interface/client";
import sql from 'mssql';
import type { GetClientsServiceResult, getClientIdInterface, getClientsServiceInterface, getTotalClientsServiceInterface, searchClientServiceInterface } from "./clientsServices.interface";



const getClientsService = async ({
    PageNumber,
    userSession,
    OrderCondition,
    searchTerm
}: getClientsServiceInterface): Promise<GetClientsServiceResult> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    }

    const clientsQuery = clientsQuerys.getClients;
    const totalClientsQuery = clientsQuerys.getTotalClients;

    const requestClients = pool.request()
        .input('PageNumber', PageNumber)
        .input('PageSize', 10)
        .input('OrderCondition', OrderCondition)
        .input('searchTerm', searchTerm)
        .query(clientsQuery);

    const requestTotal = pool.request()
        .input('searchTerm', searchTerm)
        .query(totalClientsQuery);

    const [clientsResult, totalResult] = await Promise.all([
        requestClients,
        requestTotal
    ]);

    return {
        clients: clientsResult.recordset,
        total: Number(totalResult.recordset[0]?.TotalCount ?? 0),
    };
};

const getClientIdService = async ({
    userSession,
    Id_Cliente,
    Id_Almacen,
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
    const client = request.recordset[0]
    return client
};

const getTotalClientsService = async ({
    userSession,
    searchTerm
}: getTotalClientsServiceInterface): Promise<number> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getTotalClients;
    const request = await pool.request()
        .input('searchTerm', searchTerm)
        .query(query);

    const total = request.recordset[0].TotalCount
    return total
};

const searchClientService = async ({
    userSession,
    term
}: searchClientServiceInterface): Promise<{ clients: ClientInterface[] }> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);

    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getClientBySearch;
    const result = await pool.request()
        .input('nombre', sql.VarChar, term)
        .query(query);

    const clients = result.recordset;

    return {
        clients
    }
}

export {
    getClientsService,
    getClientIdService,
    getTotalClientsService,
    searchClientService
}