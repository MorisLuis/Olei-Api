import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { ClientInterface } from "../../interface/client";
import sql from 'mssql';
import type { GetClientsServiceResult, getClientIdInterface, getClientsServiceInterface, getTotalClientsServiceInterface, searchClientServiceInterface } from "./clientsServices.interface";
import { getPrismaClient } from "../../database/prismaConnection";
import { Prisma } from "@prisma/client";



const getClientsService = async ({
    skip,
    limit,
    userSession,
    clientOrderCondition,
    searchTerm,
    searchId
}: getClientsServiceInterface): Promise<GetClientsServiceResult> => {

    const { ServidorSQL, BaseSQL } = userSession;
    const prisma = getPrismaClient(ServidorSQL, BaseSQL);

    const where = buildWhereCondition(searchTerm, searchId);
    const orderBy = buildOrder<Prisma.ClientesOrderByWithRelationInput>(
        { field: clientOrderCondition, direction: "asc"},
        'Id_Cliente'
    );

    const [clientes, totalClientes] = await Promise.all([
        prisma.clientes.findMany({ 
            where, 
            skip, 
            take: limit, 
            orderBy,
            select: {
                Nombre: true,
                Id_Almacen: true
            }
        }),
        prisma.clientes.count({ where }),
    ]);

    return {
        clients: clientes,
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

const buildWhereCondition = (term?: string, id?: number | string) => {
    const where: any = {};
    if (term) where.NombreCliente = { contains: term, mode: 'insensitive' };
    if (id) where.Id_Cliente = id;
    return where;
};

function buildOrder<T extends Record<string, any>>(
    order: { field: keyof T; direction: Prisma.SortOrder },
    defaultField: keyof T
): T {
    if (order?.field && order?.direction) {
        return { [order.field]: order.direction } as T;
    }
    return { [defaultField]: 'asc' } as T;
}


export {
    getClientsService,
    getClientIdService,
    getTotalClientsService,
    searchClientService
}