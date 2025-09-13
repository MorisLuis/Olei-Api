import sql from 'mssql';

import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { ClientInterface } from "../../interface/client";
import type { getClientsResponse, getClientIdInterface, getClientsParams, getTotalClientsServiceInterface, searchClientServiceInterface, updateClientParams } from "./types";
import { getPrismaClient } from "../../database/prismaConnection";
import type { Clientes } from "@prisma/client";
import { buildUpdate } from '../../utils/prisma/updateFunction';

const getClientsService = async (params: getClientsParams): Promise<getClientsResponse> => {

    const {
        userSession: { ServidorSQL, BaseSQL },
        orderField,
        PageNumber,
        limit,
        Nombre,
        Id_Cliente,
    } = params;

    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) {
        throw new ValidationError('Error al conectarse a base de datos principal');
    };

    let query = clientsQuerys.getClients;
    let queryTotal = clientsQuerys.getTotalClients;
    
    const totalRequest = await pool.request()
        .input('Nombre', Nombre)
        .input('Id_Cliente', Id_Cliente)
        .query(queryTotal);

    const request = await pool.request()
        .input('PageNumber', sql.Int, PageNumber)
        .input('PageSize', sql.Int, limit)
        .input('Nombre', sql.VarChar, Nombre === '' ? null : Nombre)
        .input('Id_Cliente', sql.VarChar, Id_Cliente === '' ? null : Id_Cliente)
        .input('OrderCondition', sql.VarChar, orderField)
        .query(query);

    const clientes = request.recordset;
    const totalClientes = totalRequest.recordset[0].TotalCount;

    return {
        clientes,
        total: totalClientes
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

const updateClientService = async ({
    userSession,
    Id_Cliente,
    Id_Almacen,
    body
}: updateClientParams): Promise<{ client: Clientes }> => {

    const { ServidorSQL, BaseSQL } = userSession;

    const prisma = getPrismaClient(ServidorSQL, BaseSQL);
    const data = buildUpdate(body)

    const updatedClient = await prisma.clientes.update({
        where: {
            Id_Almacen_Id_Cliente: {
                Id_Almacen,
                Id_Cliente
            }
        },
        data
    });

    return {
        client: updatedClient
    }
}

export {
    getClientsService,
    getClientIdService,
    getTotalClientsService,
    searchClientService,
    updateClientService
}