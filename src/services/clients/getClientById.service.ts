import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { ClientInterface } from "../../interface/client";
import type { getClientIdInterface } from "./types";

/**
 * Finds a client by warehouse and client identifiers in the authenticated web tenant.
 *
 * @param params - Web tenant session and validated client identifiers.
 * @returns The matching client, or `undefined` when no row matches.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */
export const getClientIdService = async ({ userSession: { ServidorSQL, BaseSQL }, Id_Cliente, Id_Almacen }: getClientIdInterface): Promise<ClientInterface> => {
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError('Error al conectarse a base de datos principal');
    const result = await pool.request()
        .input('Id_Cliente', sql.Int, Id_Cliente)
        .input('Id_Almacen', sql.Int, Id_Almacen)
        .query(clientsQuerys.getClientId);
    return result.recordset[0];
};
