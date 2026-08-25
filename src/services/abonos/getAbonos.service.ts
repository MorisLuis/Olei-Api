import dayjs from "dayjs";
import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { abonosQuery } from "../../database/querys/abonos";
import { ValidationError } from "../../errors/CustomError";
import type { getAbonosParams, getAbonosResponse } from "./types";
import { mapAbono } from "./utils";
import type { AbonoRow } from "./utils";

/**
 * Returns a filtered and paginated collection of abonos from the authenticated web tenant.
 * Date-only filters include the complete selected day, and `exactlyDate` takes precedence over a range.
 *
 * @param params - Validated filters, ordering, pagination, and web tenant session.
 * @returns The matching abonos and the total number of records for the same filters.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 */

export const getAbonosService = async (params: getAbonosParams): Promise<getAbonosResponse> => {
    const { userSession: { ServidorSQL, BaseSQL }, PageNumber, limit, orderField, orderDirection } = params;
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError("Error al conectarse a base de datos principal");

    const exactDate = params.exactlyDate ? dayjs(params.exactlyDate) : undefined;
    const startDate = exactDate ? exactDate.startOf("day").toDate() : params.startDate ? dayjs(params.startDate).startOf("day").toDate() : undefined;
    const endDate = exactDate ? exactDate.endOf("day").toDate() : params.endDate ? dayjs(params.endDate).endOf("day").toDate() : undefined;
    const fields = params.filterField?.split(',').map(field => field.trim()) ?? [];
    const values = params.filterValue?.split(',').map(value => value.trim()) ?? [];
    const filterValues = new Map(fields.map((field, index) => [field, values[index]]));

    const dataResult = await pool.request()
        .input("Folio", sql.Int, filterValues.has("Folio") ? Number(filterValues.get("Folio")) : null)
        .input("FilterIdAlmacen", sql.Int, filterValues.has("Id_Almacen") ? Number(filterValues.get("Id_Almacen")) : null)
        .input("FilterIdCliente", sql.Int, filterValues.has("Id_Cliente") ? Number(filterValues.get("Id_Cliente")) : null)
        .input("ClienteNombre", sql.NVarChar(100), filterValues.get("cliente.Nombre") ?? null)
        .input("ClienteRazonSocial", sql.NVarChar(100), filterValues.get("cliente.RazonSocial") ?? null)
        .input("ClienteRFC", sql.NVarChar(16), filterValues.get("cliente.RFC") ?? null)
        .input("FormaPagoNombre", sql.NVarChar(50), filterValues.get("forma_de_pago.Nombre") ?? null)
        .input("StartDate", sql.DateTime, startDate ?? null)
        .input("EndDate", sql.DateTime, endDate ?? null)
        .input("OrderField", sql.VarChar, orderField)
        .input("OrderDirection", sql.VarChar, orderDirection)
        .input("Skip", sql.Int, (PageNumber - 1) * limit)
        .input("Limit", sql.Int, limit)
        .query(abonosQuery.getAbonos);

    const countResult = await pool.request()
        .input("Folio", sql.Int, filterValues.has("Folio") ? Number(filterValues.get("Folio")) : null)
        .input("FilterIdAlmacen", sql.Int, filterValues.has("Id_Almacen") ? Number(filterValues.get("Id_Almacen")) : null)
        .input("FilterIdCliente", sql.Int, filterValues.has("Id_Cliente") ? Number(filterValues.get("Id_Cliente")) : null)
        .input("ClienteNombre", sql.NVarChar(100), filterValues.get("cliente.Nombre") ?? null)
        .input("ClienteRazonSocial", sql.NVarChar(100), filterValues.get("cliente.RazonSocial") ?? null)
        .input("ClienteRFC", sql.NVarChar(16), filterValues.get("cliente.RFC") ?? null)
        .input("FormaPagoNombre", sql.NVarChar(50), filterValues.get("forma_de_pago.Nombre") ?? null)
        .input("StartDate", sql.DateTime, startDate ?? null)
        .input("EndDate", sql.DateTime, endDate ?? null)
        .query(abonosQuery.getAbonosCount);

    return { abonos: (dataResult.recordset as AbonoRow[]).map(mapAbono), total: countResult.recordset[0].Total };
};
