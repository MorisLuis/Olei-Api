import sql from 'mssql';

import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { ClientInterface } from "../../interface/client";
import type { getClientsResponse, getClientIdInterface, getClientsParams, getTotalClientsServiceInterface, searchClientServiceInterface, updateClientParams } from "./types";
import { getPrismaClient } from "../../database/prismaConnection";
import type { Clientes, Prisma } from "@prisma/client";
import { buildOrder } from "../../utils/prisma/orderFunction";
import { buildUpdate } from '../../utils/prisma/updateFunction';
import { buildFilters } from '../../utils/prisma/filterFunction';

const getClientsService = async (params: getClientsParams): Promise<getClientsResponse> => {

    const {
        userSession: { ServidorSQL, BaseSQL },
        orderField,
        orderDirection,
        skip,
        limit,
        filters = [],
    } = params;

    const prisma = getPrismaClient(ServidorSQL, BaseSQL);

    const orderBy = buildOrder<Prisma.ClientesOrderByWithRelationInput>(
        { field: orderField, direction: orderDirection },
        'Id_Cliente'
    );

    const where = buildFilters(filters)

    const [clientes, totalClientes] = await Promise.all([
        prisma.clientes.findMany({
            skip,
            take: limit,
            orderBy,
            where,
            select: {
                Nombre: true,
                Id_Almacen: true,
                Id_Cliente: true,
                IdOLEI: true,
                Telefono1: true,
                CorreoVtas: true
            }
        }),
        prisma.clientes.count({ where }),
    ]);

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