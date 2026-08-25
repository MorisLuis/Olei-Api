import sql from "mssql";
import { dbConnectionWeb } from "../../database";
import { ValidationError } from "../../errors/CustomError";
import type { updateClientParams } from "./types";

type ClientRecord = Record<string, unknown>;

const clientUpdateFields = [
    "IdOLEI", "Id_Almacen", "Id_Cliente", "FechaAlta", "Nombre", "RazonSocial", "RFC", "CURP", "Calle",
    "NoExt", "NoInt", "Colonia", "Id_Ciudad", "Delegacion", "Referencia", "CodigoPost", "Telefono1",
    "Telefono2", "CorreoVtas", "CorreoCob", "CorreoAdm", "Id_FormaPago", "NumCtaPago", "Id_TipoCl",
    "Id_Vendedor", "Id_Transporte", "Id_Descuento", "Id_CondVta", "Id_ListPre", "EncPagos", "EncCompras",
    "Observaciones", "Status", "LimiteCredito", "Id_Uso", "IdUsuarioOLEI", "PasswordOLEI", "ServidorSQL",
    "BaseSQL", "UsuarioSQL", "PasswordSQL", "NoUsuarios", "Vigencia", "TimbresDisp", "SwEnvioRel",
    "FechaEnvioRel", "TipoEntrega", "DomiEntrega", "Id_Chofer", "Id_Regimen",
] as const;

type ClientUpdateField = typeof clientUpdateFields[number];
const allowedFields = new Set<string>(clientUpdateFields);
const integerFields = new Set<ClientUpdateField>([
    "IdOLEI", "Id_Almacen", "Id_Cliente", "Id_Ciudad", "Id_FormaPago", "Id_TipoCl", "Id_Vendedor",
    "Id_Transporte", "Id_Descuento", "Id_CondVta", "Id_ListPre", "Id_Uso", "NoUsuarios", "TimbresDisp",
    "Id_Chofer", "Id_Regimen",
]);
const booleanFields = new Set<ClientUpdateField>(["Status", "SwEnvioRel"]);
const dateFields = new Set<ClientUpdateField>(["FechaAlta", "Vigencia", "FechaEnvioRel"]);

/**
 * Applies a partial client update in the authenticated web tenant and returns the resulting row.
 * Only known CLIENTES columns may be selected dynamically; target identifiers and all field values
 * remain SQL parameters so request-controlled values are never interpolated into the statement.
 *
 * @param params - Web tenant session, target client identifiers, and fields to update.
 * @returns An object containing the updated client row.
 * @throws {ValidationError} When the tenant database connection is unavailable.
 * @throws {Error} When an unknown field is supplied or the target client does not exist.
 */
export const updateClientService = async ({ userSession: { ServidorSQL, BaseSQL }, Id_Cliente, Id_Almacen, body }: updateClientParams): Promise<{ client: ClientRecord }> => {
    const pool = await dbConnectionWeb(ServidorSQL, BaseSQL);
    if (!pool) throw new ValidationError('Error al conectarse a base de datos principal');

    const suppliedFields = Object.keys(body).filter(field => body[field] !== undefined);
    const invalidField = suppliedFields.find(field => !allowedFields.has(field));
    if (invalidField) throw new Error(`Unknown argument \`${invalidField}\``);
    const fields = suppliedFields as ClientUpdateField[];

    const request = pool.request()
        .input('TargetId_Almacen', sql.Int, Id_Almacen)
        .input('TargetId_Cliente', sql.Int, Id_Cliente);

    fields.forEach(field => {
        if (integerFields.has(field)) request.input(field, sql.Int, body[field]);
        else if (booleanFields.has(field)) request.input(field, sql.Bit, body[field]);
        else if (dateFields.has(field)) request.input(field, sql.DateTime, body[field]);
        else if (field === 'TipoEntrega') request.input(field, sql.SmallInt, body[field]);
        else if (field === 'LimiteCredito') request.input(field, sql.Decimal(18, 0), body[field]);
        else if (field === 'Observaciones') request.input(field, sql.VarChar(4000), body[field]);
        else if (field === 'DomiEntrega') request.input(field, sql.NVarChar(sql.MAX), body[field]);
        else request.input(field, sql.NVarChar(200), body[field]);
    });

    const query = fields.length > 0
        ? `UPDATE dbo.CLIENTES
            SET ${fields.map(field => `[${field}] = @${field}`).join(', ')}
            OUTPUT INSERTED.*
            WHERE Id_Almacen = @TargetId_Almacen AND Id_Cliente = @TargetId_Cliente;`
        : `SELECT * FROM dbo.CLIENTES
            WHERE Id_Almacen = @TargetId_Almacen AND Id_Cliente = @TargetId_Cliente;`;

    const result = await request.query(query);
    const client = result.recordset[0] as ClientRecord | undefined;
    if (!client) {
        throw new Error('An operation failed because it depends on one or more records that were required but not found. No record was found for an update.');
    }
    return { client };
};
