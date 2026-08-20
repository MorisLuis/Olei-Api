import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { clientsQuerys } from "../../database/querys/clients";
import { ValidationError } from "../../errors/CustomError";
import type { getTotalClientsServiceInterface } from "./types";

/**
 * Counts clients matching the supplied search term in the authenticated web tenant.
 *
 * @param params - Web tenant session and validated search term.
 * @returns The number of matching clients.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */
export const getTotalClientsService = async ({ userSession: { ServidorSQL, BaseSQL }, searchTerm }: getTotalClientsServiceInterface): Promise<number> => {
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError('Error al conectarse a base de datos principal');
    const result = await pool.request()
        .input('searchTerm', sql.VarChar, searchTerm)
        .query(clientsQuerys.getTotalClients);
    return result.recordset[0].TotalCount;
};
