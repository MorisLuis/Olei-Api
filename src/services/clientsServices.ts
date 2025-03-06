import { dbConnection } from "../database";
import { clientsQuerys } from "../database/querys/clients";
import { UnauthorizedError, ValidationError } from "../errors/CustomError";
import { handleGetWebSession } from "../utils/Redis/getSession";
import sql from 'mssql';

interface getClientsServiceInterface {
    PageNumber: number,
    sessionId: string,
    OrderCondition: string
};

const getClientsService = async ({
    PageNumber,
    sessionId,
    OrderCondition
}: getClientsServiceInterface) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

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
    sessionId: string,
    Id_Cliente: number,
    Id_Almacen: number
};

const getClientIdService = async ({
    sessionId,
    Id_Cliente,
    Id_Almacen
}: getClientIdInterface) => {


    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
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

const getTotalClientsService = async (sessionId: string) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });
    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);
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
    sessionId: string;
    term: string
};

const searchClientService = async ({
    sessionId,
    term
} : searchClientServiceInterface ) => {

    const { user: userFR } = await handleGetWebSession({ sessionId });

    if (!userFR) {
        throw new UnauthorizedError('Sesion terminada')
    }

    const { Serverweb, Baseweb } = userFR;
    const pool = await dbConnection(Serverweb, Baseweb);

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