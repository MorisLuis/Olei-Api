import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { getClientsParams, getClientsResponse } from "./types";

/**
 * Returns a filtered, ordered, and paginated client list from the authenticated web tenant.
 *
 * @param params - Web tenant session and validated list query parameters.
 * @returns The current page of clients and the matching total count.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */
export const getClientsService = async (params: getClientsParams): Promise<getClientsResponse> => {
    const { userSession: { ServidorSQL, BaseSQL }, orderField, PageNumber, limit, Nombre, Id_Cliente, Id_Almacen } = params;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError('Error al conectarse a base de datos principal');

    const totalRequest = await pool.request()
        .input('Nombre', sql.VarChar, Nombre === '' ? null : Nombre)
        .input('Id_Cliente', sql.VarChar, Id_Cliente === '' ? null : Id_Cliente)
        .input('Id_Almacen', sql.Int, Id_Almacen === '' ? null : Id_Almacen)
        .query(clientsQuerys.getTotalClients);

    const request = await pool.request()
        .input('PageNumber', sql.Int, PageNumber)
        .input('PageSize', sql.Int, limit)
        .input('Nombre', sql.VarChar, Nombre === '' ? null : Nombre)
        .input('Id_Cliente', sql.VarChar, Id_Cliente === '' ? null : Id_Cliente)
        .input('Id_Almacen', sql.Int, Id_Almacen === '' ? null : Id_Almacen)
        .input('OrderCondition', sql.VarChar, orderField)
        .query(clientsQuerys.getClients);

    return { clientes: request.recordset, total: totalRequest.recordset[0].TotalCount };
};
