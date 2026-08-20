import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { ClientInterface } from "../../interface/client";
import type { searchClientServiceInterface } from "./types";

/**
 * Searches the authenticated web tenant for up to ten clients by name.
 *
 * @param params - Web tenant session and validated search term.
 * @returns An object containing the matching clients.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */
export const searchClientService = async ({ userSession: { ServidorSQL, BaseSQL }, term }: searchClientServiceInterface): Promise<{ clients: ClientInterface[] }> => {
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError('Error al conectarse a base de datos principal');
    const result = await pool.request()
        .input('nombre', sql.VarChar, term)
        .query(clientsQuerys.getClientBySearch);
    return { clients: result.recordset };
};
