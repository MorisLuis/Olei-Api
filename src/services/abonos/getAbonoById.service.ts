import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { abonosQuery } from "../../database/querys/abonos";
import { ValidationError } from "../../errors/CustomError";
import type { getAbonoByIdParams, getAbonoByIdResponse } from "./types";
import { mapAbono } from "./utils";
import type { AbonoRow } from "./utils";

/**
 * @description Finds one abono by its warehouse and folio within the authenticated web tenant.
 * 
 * Consumer: CRM
 * Current endpoint: `GET /api/abonos/:folio`
 *
 * @param params - Web tenant session and the validated compound identifier.
 * @returns An object containing the abono, or `null` when it does not exist.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */
export const getAbonoByIdService = async ({ userSession: { ServidorSQL, BaseSQL }, Id_Almacen, Folio }: getAbonoByIdParams): Promise<getAbonoByIdResponse> => {
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError("Error al conectarse a base de datos principal");
    const result = await pool.request()
        .input("Id_Almacen", sql.Int, Id_Almacen)
        .input("Folio", sql.Int, Folio)
        .query(abonosQuery.getAbonoById);
    const row = result.recordset[0] as AbonoRow | undefined;
    return { abono: row ? mapAbono(row) : null };
};
