import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { abonosQuery } from "../../database/querys/abonos";
import { ValidationError } from "../../errors/CustomError";
import type { AbonoDetailsInterface, GetAbonoDetailsParams } from "./types";

/**
 * @description Returns the paginated sales documents applied to an abono.
 * @param params - Web tenant session, folio, and requested page number.
 * @returns The detail rows for the requested page.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */

export const getAbonoDetailsService = async ({ userSession: { ServidorSQL, BaseSQL }, PageNumber, folio }: GetAbonoDetailsParams): Promise<{ abonoDetails: AbonoDetailsInterface[] }> => {
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError("Error al conectarse a base de datos principal");
    const result = await pool.request()
        .input("PageNumber", sql.Int, PageNumber)
        .input("PageSize", sql.Int, 10)
        .input("Folio", sql.Int, Number(folio))
        .query(abonosQuery.getAbonoDetails);
    return { abonoDetails: result.recordset };
};
